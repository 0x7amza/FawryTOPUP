const axios = require("axios");

const sendUssd = async (queryParam) => {
  const response = await axios.get(
    "http://" +
      queryParam.host.toString() +
      ":" +
      queryParam.port +
      "/goip_send_ussd.html?username=" +
      queryParam.username +
      "&password=" +
      encodeURIComponent(queryParam.password) +
      "&port=" +
      queryParam.portNumber.toString() +
      "&ussd=" +
      encodeURIComponent(queryParam.ussd)
  );

  return response.data;
};

const sendSms = async (queryParam) => {
  const data = {
    type: "send-sms",
    task_num: 1,
    tasks: [
      {
        tid: 1223,
        from: queryParam.portNumber + ".01",
        to: queryParam.to,
        sms: queryParam.sms,
      },
    ],
  };
  console.log(queryParam);

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url:
      "http://" +
      queryParam.host +
      ":" +
      queryParam.port +
      "/goip_post_sms.html?username=" +
      queryParam.username +
      "&password=" +
      queryParam.password,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };
  const response = await axios.request(config);
  return response.data;
};

module.exports = {
  sendUssd,
  sendSms,
};
