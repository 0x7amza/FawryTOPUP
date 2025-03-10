// utils/serverUtils.js
const axios = require("axios");
const { log } = require("winston");

const sendUssd = async (queryParam) => {
  try {
    if (
      !queryParam.host ||
      !queryParam.port ||
      !queryParam.username ||
      !queryParam.password
    ) {
      throw new Error("Missing required server parameters");
    }

    const url = `http://${queryParam.host}:${queryParam.port}/goip_send_ussd.html`;
    const response = await axios.get(url, {
      params: {
        username: queryParam.username,
        password: encodeURIComponent(queryParam.password),
        port: queryParam.portNumber,
        ussd: encodeURIComponent(queryParam.ussd),
      },
      timeout: 20000,
    });

    console.log(response.data);
    if (response.data.error) {
      throw new Error(`Server Error: ${response.data.error}`);
    }

    return response.data;
  } catch (error) {
    console.error("sendUssd Error:", error.message);
    return {
      error: true,
      message: error.message,
      details: error.response?.data || "No server response",
    };
  }
};

const sendSms = async (queryParam) => {
  try {
    if (
      !queryParam.host ||
      !queryParam.port ||
      !queryParam.username ||
      !queryParam.password ||
      !queryParam.to ||
      !queryParam.sms
    ) {
      throw new Error("Missing required SMS parameters");
    }

    const data = {
      type: "send-sms",
      task_num: 1,
      tasks: [
        {
          tid: 1223,
          from: `${queryParam.portNumber}.01`,
          to: queryParam.to,
          sms: queryParam.sms,
        },
      ],
    };

    const config = {
      method: "post",
      url: `http://${queryParam.host}:${queryParam.port}/goip_post_sms.html`,
      params: {
        username: queryParam.username,
        password: queryParam.password,
      },
      headers: { "Content-Type": "application/json" },
      data: data,
      timeout: 15000,
    };

    const response = await axios(config);
    console.log("sendSms response:", response.data);

    if (response.data.error) {
      throw new Error(`Server Error: ${response.data.error}`);
    }

    return response.data;
  } catch (error) {
    console.error("sendSms Error:", error.message);
    return {
      error: true,
      message: error.message,
      details: error.response?.data || "No server response",
    };
  }
};

module.exports = { sendUssd, sendSms };
