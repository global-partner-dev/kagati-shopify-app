import { ActionOptions, KhagatiSMSGlobalActionContext } from "gadget-server";
const axios = require("axios");


/**
 * Function to execute the global action for sending an SMS notification.
 * 
 * @param {KhagatiSMSGlobalActionContext} context - The context object containing parameters and resources
 * for executing the global action.
 * 
 * @returns {Promise<void>}
 */
export async function run({ params, logger, api }) {
  logger.info({smsRequestData: JSON.parse(params.smsRequestData)}, "smsRequestData----------->>")
    const formatPhoneNumber = (phoneNumber) => {
      
      phoneNumber = phoneNumber.replace(/\s+/g, '');
      logger.info({ phoneNumber: phoneNumber }, "phoneNumber---->>");
  
      if (phoneNumber.startsWith('+')) {
          phoneNumber = phoneNumber.slice(1);
      }
      if (phoneNumber.length === 12) {
        if (phoneNumber.startsWith("91")) {
          return phoneNumber;
        } else {
          console.error('Invalid phone number format:', phoneNumber);
          return null;
        }
      } else if (phoneNumber.length === 10) {
        return '91' + phoneNumber;
      } else {
        console.error('Invalid phone number format:', phoneNumber);
        return null;
      }
    }
    const baseUrl = process.env.SMS_URL || "https://ngui.sendmsg.in/smpp";
    const username = process.env.SMS_Username;
    const password = process.env.SMS_Password;
    const senderId = process.env.SMS_GID;
    
    logger.info({ params }, "-----Data------");
    let responseData;

    try {
        responseData = JSON.parse(params.smsRequestData);
    } catch (error) {
        logger.error('Error parsing smsRequestData:', error);
        return; // Exit if JSON parsing fails
    }

    logger.info({ responseData }, "-----responseData------");
    const subject = params.subject;
    logger.info({ subject }, "-----subject------");

    const { orderName, cName, phoneNumber } = responseData;
    logger.info({ orderName }, "-----orderName------");
    logger.info({ cName }, "-----cName------");
    logger.info({ phoneNumber }, "-----phoneNumber------");

    const phoneNum = formatPhoneNumber(phoneNumber);
    
    if (!phoneNum) {
        logger.error('Formatted phone number is invalid.');
        return; // Exit if phone number formatting fails
    }

    logger.info({ phoneNum }, "-----converted phoneNum------");
    
    logger.info({ responseData }, "Parsed Response Data");
    logger.info({ subject }, "Subject");
    
    try {
        let templateId;
        let smsTemplateText;

        // Set the correct template based on the subject
        if (subject === "Confirmation") {
            templateId = "1707172603984328014";
            smsTemplateText = `Dear ${cName},
Thank you for shopping with us. Your Order Number is ${orderName}. We are preparing your order for shipping and will update you once it is shipped. 
The Pet Project.`;
        } else if (subject === "OutForDelivery") {
            templateId = "1707172604006764624";
            smsTemplateText = `Dear ${cName},
Your order ${orderName} is shipped and is on its way to reach you. We hope you receive it at the earliest. 
The Pet Project.`;
        } else if (subject === "Delivered") {
            templateId = "1707172604035592043";
            smsTemplateText = `Dear ${cName},
Your order (${orderName}) is delivered. Please contact our customer care team on 7259124665 if you need any help with your order.
The Pet Project.`;
        } else if (subject === "ON_HOLD") {
          templateId = "1707173261404130453"
          smsTemplateText = `Hey! Your order is on hold, but don't worry - we're on it and will reach out soon. In the meantime, feel free to call or WhatsApp us on 7259124665. The Pet Project`;
        } else if (subject === "CANCELED") {
          templateId = "1707173261412555484"
          smsTemplateText = `Hey, your order's been cancelled. We're sorry for the inconvenience. We'll process your refund, if any, soon. Feel free to reach us at 7259124665. The Pet Project`;
        }
    const encodedText = encodeURIComponent(smsTemplateText);
    const apiUrl = baseUrl;
    const urlshortening = 1
    const params = {
        username: username,
        password: password,
        from: senderId,
        to: phoneNum,
        urlshortening: urlshortening,
        text: encodedText
    };

    try {
        // Send the POST request
        const response = await axios.post(apiUrl, null, { params });
        console.log('SMS sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending SMS:', error.response ? error.response.data : error.message);
    }
        // Construct the URL for the SMS request
        // const encodedText = encodeURIComponent(smsTemplateText);

        // const url = `${baseUrl}?username=${username}&password=${password}&from=${senderId}&smsmsgid=${templateId}&to=${"917397398839"}&text=${encodedText}&urlshortening=1`;

        // logger.info({ url }, "SMS URL----------->");

        // // Send the SMS using a GET request
        // const response = await fetch(url, { method: 'GET' });

        // // Check the response status and log the outcome
        // if (response.ok) {
        //     const responseBody = await response.text(); // Read the response body as text
        //     logger.info({ responseBody: responseBody }, "Response Body");
        // } else {
        //     throw new Error(`Failed to send SMS. Status: ${response.status}`);
        // }
    } catch (error) {
        // Catch any errors that occur in the try block
        logger.error('Error in sending SMS:', error);
    }
}

/** @type {ActionOptions} */
export const options = {};

export const params = {
    smsRequestData: {
        type: "string",
    },
    subject: {
        type: "string",
    }
}
