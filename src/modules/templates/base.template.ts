export interface BaseTemplateOptions {
  title: string;
  previewText?: string;
  content: string;
}

export function BaseTemplate({
  title,
  previewText = '',
  content,
}: BaseTemplateOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f7;
      color: #333333;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f4f7;
      padding: 40px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.07);
    }
    .header {
      background: linear-gradient(135deg, #6c47ff 0%, #4f8ef7 100%);
      padding: 32px 40px;
      text-align: center;
    }
    .header .logo {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .header .logo span {
      opacity: 0.7;
    }
    .body {
      padding: 40px;
    }
    .body h1 {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 12px;
    }
    .body p {
      font-size: 15px;
      line-height: 1.7;
      color: #555770;
      margin-bottom: 16px;
    }
    .btn {
      display: inline-block;
      margin: 8px 0 24px;
      padding: 14px 32px;
      background: linear-gradient(135deg, #6c47ff, #4f8ef7);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.2px;
    }
    .divider {
      border: none;
      border-top: 1px solid #eeeef2;
      margin: 28px 0;
    }
    .meta-box {
      background: #f8f8fc;
      border-radius: 8px;
      padding: 20px 24px;
      margin: 20px 0;
    }
    .meta-box p {
      margin-bottom: 6px;
      font-size: 14px;
    }
    .meta-box strong {
      color: #1a1a2e;
    }
    .otp-code {
      display: block;
      font-size: 40px;
      font-weight: 800;
      letter-spacing: 10px;
      color: #6c47ff;
      text-align: center;
      padding: 24px 0;
      background: #f3f0ff;
      border-radius: 8px;
      margin: 20px 0;
    }
    .footer {
      background-color: #f8f8fc;
      padding: 28px 40px;
      text-align: center;
      border-top: 1px solid #eeeef2;
    }
    .footer p {
      font-size: 12px;
      color: #9999aa;
      line-height: 1.6;
    }
    .footer a {
      color: #6c47ff;
      text-decoration: none;
    }
    @media (max-width: 600px) {
      .body { padding: 28px 24px; }
      .footer { padding: 20px 24px; }
      .header { padding: 24px; }
      .otp-code { font-size: 32px; letter-spacing: 6px; }
    }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ''}
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">Collabzz<span>.io</span></div>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>
          You received this email because you have an account on Collabzz.<br/>
          &copy; ${new Date().getFullYear()} Collabzz. All rights reserved.<br/>
          <a href="#">Unsubscribe</a> &middot; <a href="#">Privacy Policy</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
