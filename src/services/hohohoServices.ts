import { Response } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET, JWT_EXPIRY } from "../config/hohohoConfig";
import { hohohoLogger } from "../utils/logger";
import {
  generateVerificationCode,
  sanitizeApplicationDetails,
} from "../utils/hohohoUtils";
import { sendHohohoEmailService } from "./emailsService";
import {
  checkApplicationInitiationExistsInDB,
  createEmptyApplicationDetails,
  getApplicationDetailsFromDB,
  getApplicationInitiationFromDB,
  logApplicationInitiationToDB,
  updateApplicationDetailsInDB,
  updateApplicationStatusToActive,
} from "./hohohoDbService";
import { ApplicationInitiation } from "../types/hohohoTypes";

export const sendApplicationCodeEmail = async (
  email: string,
  lang: string,
  verificationCode: string
): Promise<void> => {
  const messages = {
    en: {
      subject: "Your Application Code",
      text: `Hello!\n\nThank you for your interest in starting an application.\n\nYour application code is: ${verificationCode}. It will expire in 15 minutes.\n\nLooking forward to receiving your application!\n\nDanilo Canguçu`,
      html: `<p>Hello!</p><p>Thank you for your interest in starting an application.</p><p>Your application code is: <strong>${verificationCode}</strong>. It will expire in 15 minutes.</p><p>Looking forward to receiving your application!</p><p>Danilo Canguçu</p>`,
    },
    es: {
      subject: "Tu Código para Propuesta",
      text: `¡Hola!\n\nGracias por tu interés en iniciar una propuesta.\n\nTu código para la propuesta es: ${verificationCode}. Caducará en 15 minutos.\n\n¡Espero con interés recibir tu propuesta!\n\nDanilo Canguçu`,
      html: `<p>¡Hola!</p><p>Gracias por tu interés en iniciar una propuesta.</p><p>Tu código para la propuesta es: <strong>${verificationCode}</strong>. Caducará en 15 minutos.</p><p>¡Espero con interés recibir tu propuesta!</p><p>Danilo Canguçu</p>`,
    },
    ptbr: {
      subject: "Seu Código para Proposta",
      text: `Olá!\n\nObrigado pelo seu interesse em iniciar uma proposta.\n\nO seu código para a proposta é: ${verificationCode}. Ele expirará em 15 minutos.\n\nAguardando ansiosamente a sua proposta!\n\nDanilo Canguçu`,
      html: `<p>Olá!</p><p>Obrigado pelo seu interesse em iniciar uma proposta.</p><p>O seu código para a proposta é: <strong>${verificationCode}</strong>. Ele expirará em 15 minutos.</p><p>Aguardando ansiosamente a sua proposta!</p><p>Danilo Canguçu</p>`,
    },
  };

  type Lang = "en" | "es" | "ptbr";
  const { subject, text, html } = messages[lang as Lang] || messages.en;

  await sendHohohoEmailService(email, subject, text, html);
};


export const registerApplicationService = async (
  email: string,
  lang: string,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const verificationCode = generateVerificationCode();

  try {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await logApplicationInitiationToDB(
      email,
      verificationCode,
      lang,
      expiresAt
    );

    await sendApplicationCodeEmail(email, lang, verificationCode);

    return res.status(200).send({
      message: {
        en: "Email sent successfully with the application code.",
        es: "Correo con código enviado con éxito.",
        ptbr: "Email com código enviado com sucesso.",
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "An active or pending application initiation already exists"
      )
    ) {
      return res.status(400).send({
        message: {
          en: "An application code has been already sent to your email. If you don’t see it, check your spam folder. You can request a new one in 15 minutes.",
          es: "Ya se ha enviado un código de propuesta a tu correo electrónico. Si no lo ves, revisa tu carpeta de spam. Puedes solicitar uno nuevo en 15 minutos.",
          ptbr: "Um código de proposta já foi enviado ao seu e-mail. Se não o encontrar, verifique a pasta de spam. Você pode solicitar um novo em 15 minutos.",
        },
      });
    }

    hohohoLogger.error("Error in registerApplicationService:", error);
    return res.status(500).send({
      message: {
        en: "Failed to send your email with the application code. Please try again later.",
        es: "No se pudo enviar el correo con el código de propuesta. Por favor, inténtalo de nuevo más tarde.",
        ptbr: "Falha ao enviar o e-mail com o código de proposta. Por favor, tente novamente mais tarde.",
      },
    });
  }
};

// TODO refactor loginApplicationService
export const loginApplicationService = async (
  email: string,
  code: string,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const applicationExists = await checkApplicationInitiationExistsInDB(
      email,
      code
    );

    if (!applicationExists) {
      return res.status(404).send({
        message:
          "No pending or active application found for this email and code. Please start a new application.",
      });
    }

    const applicationInitiation: ApplicationInitiation | null =
      await getApplicationInitiationFromDB(email, code);

    if (!applicationInitiation) {
      return res.status(404).send({
        message:
          "Application could not be found. Please start a new application.",
      });
    }

    if (
      applicationInitiation.status !== "active" &&
      applicationInitiation.status !== "pending"
    ) {
      hohohoLogger.error(
        `Unexpected application status "${applicationInitiation.status}" from email ${email} while logging in.`
      );
      return res.status(400).send({
        message:
          "There was an issue with your application. This has been logged and will be investigated. Please contact Danilo for support.",
      });
    }

    if (applicationInitiation.status === "pending") {
      await createEmptyApplicationDetails(
        applicationInitiation.id,
        applicationInitiation.email,
        applicationInitiation.lang
      );
      hohohoLogger.info(
        `Successful function call to createEmptyApplicationDetails with applicationInitiationId ${applicationInitiation.id}`
      );

      await updateApplicationStatusToActive(applicationInitiation.id);
      hohohoLogger.info(
        `Successful function call to updateApplicationStatusToActive with applicationInitiationId ${applicationInitiation.id}`
      );
    }

    const tokenPayload = {
      applicationInitiationId: applicationInitiation.id,
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    hohohoLogger.info(`Application login successful for email: ${email}`);

    return res.status(200).send({
      message: "Login successful. Loading your application...",
      token,
    });
  } catch (error) {
    hohohoLogger.error(`Failed to login application: ${error}`);
    return res.status(500).send({
      message: "Failed to login. Please try again.",
    });
  }
};

export const getApplicationService = async (
  applicationInitiationId: string,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const applicationDetails = await getApplicationDetailsFromDB(
      Number(applicationInitiationId)
    );

    if (!applicationDetails) {
      hohohoLogger.warn(
        `Application details not found for id ${applicationInitiationId}`
      );
      return res.status(404).send({
        message:
          "Application details not found. Please contact Danilo for support.",
      });
    }

    const sanitizedApplicationDetails =
      sanitizeApplicationDetails(applicationDetails);

    hohohoLogger.info(
      `Got application successfully & sanitized for id ${applicationInitiationId}. Sending response.`
    );
    return res.status(200).send({
      message: "Application successfully retrieved.",
      application: sanitizedApplicationDetails,
    });
  } catch (error) {
    return res.status(500).send({
      message:
        "Failed to load your application. Please contact Danilo for support.",
    });
  }
};

export const postApplicationService = async (
  applicationInitiationId: number,
  applicationData: any,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const { isComplete } = applicationData;
    // Check if the application exists in the DB
    const existingApplication = await getApplicationDetailsFromDB(
      applicationInitiationId
    );

    if (!existingApplication) {
      hohohoLogger.warn(
        `No application found for initiation ID ${applicationInitiationId}`
      );
      return res.status(404).send({
        message:
          "Application not found. Please ensure the correct initiation ID.",
      });
    } else if (existingApplication.iscomplete) {
      hohohoLogger.warn(
        `Application already submitted for initiation ID ${applicationInitiationId}`
      );
      return res.status(400).send({
        message: "Application already submitted. No further changes allowed.",
      });
    }

    hohohoLogger.info(
      `Updating application for initiation ID ${applicationInitiationId}`
    );
    const updatedApplication = await updateApplicationDetailsInDB(
      applicationInitiationId,
      applicationData
    );

    const sanitizedApplicationDetails =
      sanitizeApplicationDetails(updatedApplication);

    return res.status(200).send({
      message: isComplete
        ? "Application submitted successfully."
        : "Application saved successfully.",
      application: sanitizedApplicationDetails,
    });
  } catch (err) {
    if (err instanceof Error) {
      hohohoLogger.error(
        `Error (Instance of Error) in postApplicationService: ${err.message}`
      );
    } else {
      hohohoLogger.error(`Error in postApplicationService: ${String(err)}`);
    }
    return res.status(500).send({
      message:
        "Failed to save or submit your application. Please contact Danilo for support.",
    });
  }
};
