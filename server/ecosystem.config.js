module.exports = {
  apps: [
    {
      name: "mikane-api",
      script: "index.js"
    }
  ],
  deploy: {
    test: {
      user: process.env.SSH_USER,
      host: process.env.SSH_HOST,
      key: "deploy.key",
      ref: "origin/main",
      repo: "https://github.com/pudding-tech/mikane",
      path: "/opt/mikane-test/",
      "post-deploy": "pm2 reload ecosystem.config.js --env dev",
      env: {
        NODE_ENV: "dev",
        DATABASE_ADDRESS: process.env.DATABASE_ADDRESS
      }
    }
  }
};
