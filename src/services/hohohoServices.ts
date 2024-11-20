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
      subject: "Your Code to Get Started",
      text: `Hello!\n\nThank you for your interest in starting an application. I'm so glad you're taking this first step!\n\nYour code is: ${verificationCode}. It will be valid for 15 minutes, so be sure to use it soon.\n\nOnce you log in, your application will be active. You’ll always need this code to access it again, so please keep it safe!\n\nI can’t wait to hear more about you and your proposal for the website.\n\nIf you have any questions or encounter any issues, feel free to reply to this email. I’ll respond as quickly as I can!\n\nBest regards,\nDanilo Canguçu`,
      html: `<p>Hello!</p>
      <p>Thank you for your interest in starting an application. I'm so glad you're taking this first step!</p>
      <p>Your code is: <strong>${verificationCode}</strong>. It will be valid for 15 minutes, so be sure to use it soon.</p>
      <p>Once you log in, your application will be active. You’ll always need this code to access it again, so please keep it safe!</p>
      <p>I can’t wait to hear more about you and your proposal for the website.</p>
      <p>If you have any questions or encounter any issues, feel free to reply to this email. I’ll respond as quickly as I can!</p>
      <p>Best regards,<br>Danilo Canguçu</p>`,
    },
    es: {
      subject: "Tu Código para Comenzar",
      text: `¡Hola!\n\nGracias por tu interés en iniciar una propuesta. ¡Estoy muy contento de que estés dando este primer paso!\n\nTu código es: ${verificationCode}. Será válido por 15 minutos, así que úsalo pronto.\n\nUna vez que inicies sesión, tu propuesta estará activa. Siempre necesitarás este código para acceder a ella nuevamente, ¡así que guárdalo bien!\n\nEstoy ansioso por saber más sobre ti y tu propuesta para el sitio web.\n\nSi tienes preguntas o encuentras algún problema, no dudes en responder a este correo. ¡Te responderé lo antes posible!\n\nSaludos,\nDanilo Canguçu`,
      html: `<p>¡Hola!</p>
      <p>Gracias por tu interés en iniciar una propuesta. ¡Estoy muy contento de que estés dando este primer paso!</p>
      <p>Tu código es: <strong>${verificationCode}</strong>. Será válido por 15 minutos, así que úsalo pronto.</p>
      <p>Una vez que inicies sesión, tu propuesta estará activa. Siempre necesitarás este código para acceder a ella nuevamente, ¡así que guárdalo bien!</p>
      <p>Estoy ansioso por saber más sobre ti y tu propuesta para el sitio web.</p>
      <p>Si tienes preguntas o encuentras algún problema, no dudes en responder a este correo. ¡Te responderé lo antes posible!</p>
      <p>Saludos,<br>Danilo Canguçu</p>`,
    },
    ptbr: {
      subject: "Seu Código para Começar",
      text: `Olá!\n\nObrigado pelo seu interesse em iniciar uma proposta. Fico muito feliz que você esteja dando este primeiro passo!\n\nO seu código é: ${verificationCode}. Ele será válido por 15 minutos, então use-o logo.\n\nAssim que você fizer login, sua proposta estará ativa. Você sempre precisará deste código para acessá-la novamente, então guarde-o bem!\n\nMal posso esperar para saber mais sobre você e sua proposta para o site.\n\nSe tiver dúvidas ou problemas, é só responder a este e-mail. Vou te responder o mais rápido possível!\n\nAtenciosamente,\nDanilo Canguçu`,
      html: `<p>Olá!</p>
      <p>Obrigado pelo seu interesse em iniciar uma proposta. Fico muito feliz que você esteja dando este primeiro passo!</p>
      <p>O seu código é: <strong>${verificationCode}</strong>. Ele será válido por 15 minutos, então use-o logo.</p>
      <p>Assim que você fizer login, sua proposta estará ativa. Você sempre precisará deste código para acessá-la novamente, então guarde-o bem!</p>
      <p>Mal posso esperar para saber mais sobre você e sua proposta para o site.</p>
      <p>Se tiver dúvidas ou problemas, é só responder a este e-mail. Vou te responder o mais rápido possível!</p>
      <p>Atenciosamente,<br>Danilo Canguçu</p>`,
    },
  };

  type Lang = "en" | "es" | "ptbr";
  const { subject, text, html } = messages[lang as Lang] || messages.en;

  await sendHohohoEmailService(email, subject, text, html);
};

export const sendApplicationSubmittedEmail = async (
  email: string,
  lang: string
): Promise<void> => {
  const messages = {
    en: {
      subject: "Your Application Submission",
      text: `Hello!\n\nYour application was submitted successfully!\n\nThe selection process will end on December 22nd. You’ll be informed if your proposal has been selected between the 22nd and 24th. However, please note that I may contact you for a video chat before then, or in case your application is not selected.\n\nIn the meantime, you can log in and check the status of your submission by clicking the link here: https://danilocangucu.net/hohoho/my-application?lang=en\n\nThank you for your interest and good luck!\n\nKind regards,\nDanilo Canguçu`,
      html: `<p>Hello!</p>
      <p>Your application was submitted successfully!</p>
      <p>The selection process will conclude on December 22nd. You’ll be informed if your proposal has been selected between the 22nd and 24th. However, please note that I may contact you for a video chat before then, or in case your application is not selected.</p>
      <p>In the meantime, you can log in and check the details of your submission by clicking the link here: <a href="https://danilocangucu.net/hohoho/my-application?lang=en">here</a>.</p>
      <p>Thank you for your interest and good luck!</p>
      <p>Kind regards,<br>Danilo Canguçu</p>`,
    },
    es: {
      subject: "Tu Propuesta ha Sido Enviada",
      text: `¡Hola!\n\n¡Tu propuesta fue enviada con éxito!\n\nEl proceso de selección finalizará el 22 de diciembre. Serás informadx si tu propuesta fue seleccionada entre el 22 y el 24 de diciembre. Sin embargo, ten en cuenta que podría contactarte antes de esa fecha para una videollamada, o en caso de que tu propuesta no sea seleccionada.\n\nMientras tanto, puedes iniciar sesión y revisar los detalles de tu envío haciendo clic en el siguiente enlace: https://danilocangucu.net/hohoho/my-application?lang=es\n\n¡Gracias por tu interés y mucha suerte!\n\nSaludos,\nDanilo Canguçu`,
      html: `<p>¡Hola!</p>
      <p>¡Tu propuesta fue enviada con éxito!</p>
      <p>El proceso de selección finalizará el 22 de diciembre. Serás informadx si tu propuesta fue seleccionada entre el 22 y el 24 de diciembre. Sin embargo, ten en cuenta que podría contactarte antes de esa fecha para una videollamada, o en caso de que tu propuesta no sea seleccionada.</p>
      <p>Mientras tanto, puedes iniciar sesión y revisar los detalles de tu envío haciendo clic en el siguiente enlace: <a href="https://danilocangucu.net/hohoho/my-application?lang=es">aquí</a>.</p>
      <p>¡Gracias por tu interés y mucha suerte!</p>
      <p>Saludos,<br>Danilo Canguçu</p>`,
    },
    ptbr: {
      subject: "Sua Proposta Foi Enviada",
      text: `Olá!\n\nSua proposta foi enviada com sucesso!\n\nO processo de seleção terminará no dia 22 de dezembro. Você será informade se sua proposta foi selecionada entre os dias 22 e 24 de dezembro. No entanto, vale ressaltar que posso entrar em contato com você antes dessa data para uma conversa por videochamada, ou caso sua proposta não seja selecionada.\n\nEnquanto isso, você pode fazer login e revisar os detalhes da sua proposta clicando no link aqui: https://danilocangucu.net/hohoho/my-application?lang=ptbr\n\nAgradeço pelo seu interesse e boa sorte!\n\nAtenciosamente,\nDanilo Canguçu`,
      html: `<p>Olá!</p>
      <p>Sua proposta foi enviada com sucesso!</p>
      <p>O processo de seleção terminará no dia 22 de dezembro. Você será informade se sua proposta foi selecionada entre os dias 22 e 24 de dezembro. No entanto, vale ressaltar que posso entrar em contato com você antes dessa data para uma conversa por videochamada, ou caso sua proposta não seja selecionada.</p>
      <p>Enquanto isso, você pode fazer login e revisar os detalhes da sua proposta clicando no link aqui: <a href="https://danilocangucu.net/hohoho/my-application?lang=ptbr">aqui</a>.</p>
      <p>Agradeço pelo seu interesse e boa sorte!</p>
      <p>Atenciosamente,<br>Danilo Canguçu</p>`,
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
        applicationInitiation.preferred_language
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

    if (isComplete) {
      hohohoLogger.info(
        `Application marked as complete for initiation ID ${applicationInitiationId}`
      );
      await sendApplicationSubmittedEmail(
        applicationData.personalInformation.emailAddress,
        applicationData.personalInformation.preferredLanguage
      );
      hohohoLogger.info(
        `Email sent successfully for application submission for initiation ID ${applicationInitiationId}`
      );
    }

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
