// import * as html from "tagged-template-noop";

const html = require("tagged-template-noop");

export default html`
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no" />
      ${!process.env.LOCAL_FONTS
        ? html`
            <link
              href="https://fonts.googleapis.com/css2?family=Baloo+Chettan+2:wght@400;500;600;700;800&display=swap"
              rel="stylesheet"
            />
          `
        : ""}
      <script>
        window.env = ${JSON.stringify(
          Object.keys(process.env)
            .filter((key) => key.startsWith("REACT_"))
            .reduce((memo, key) => ({ ...memo, [key]: process.env[key] }), {})
        )};
      </script>

      <style type="text/css">
        html,
        body {
          margin: 0;
          padding: 0;
          font-family: "Baloo Chettan 2", sans-serif;
        }
      </style>
      <!-- jss-insertion-point -->
    </head>
    <body>
      <div id="root"></div>
      <script src="${process.env.URL_CLIENT}"></script>
    </body>
  </html>
`;
