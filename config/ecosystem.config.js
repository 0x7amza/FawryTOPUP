module.exports = {
  apps: [
    {
      name: "my-app",
      script: "app.js",
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 10,
    },
  ],
};
