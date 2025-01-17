import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SESv2Client, SendEmailCommand } from "npm:@aws-sdk/client-sesv2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting email sending process...");

    const { to, memorialUrl, qrCodeUrl } = await req.json();
    console.log("Received request data:", { to, memorialUrl, qrCodeUrl });

    const client = new SESv2Client({
      region: "sa-east-1",
      credentials: {
        accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID") || '',
        secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY") || '',
      },
    });

    const command = new SendEmailCommand({
      FromEmailAddress: "contact@memoryys.com",
      Destination: {
        ToAddresses: [to],
      },
      Content: {
        Simple: {
          Subject: {
            Data: "Seu memorial está pronto! 💕 | Your memorial is ready! 💕",
            Charset: "UTF-8",
          },
          Body: {
            Html: {
              Data: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <title>Seu memorial está pronto! | Your memorial is ready!</title>
                  </head>
                  <body>
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                      <h1 style="color: #FF1493; text-align: center;">
                        Seu memorial está pronto! 💕<br>
                        Your memorial is ready! 💕
                      </h1>
                      
                      <p style="text-align: center;">
                        Seu pagamento foi confirmado e seu site memorial agora está ativo!<br>
                        Your payment has been confirmed and your memorial site is now active!
                      </p>

                      <div style="text-align: center; margin: 30px 0;">
                        <img src="${qrCodeUrl}" 
                             alt="QR Code" 
                             style="max-width: 200px; height: auto;">
                        
                        <p>
                          <a href="${qrCodeUrl}" 
                             download="qr-code-memorial.png"
                             style="background-color: #FF1493; 
                                    color: white; 
                                    padding: 10px 20px; 
                                    text-decoration: none; 
                                    border-radius: 5px; 
                                    display: inline-block; 
                                    margin-top: 10px;">
                            Baixar QR Code | Download QR Code
                          </a>
                        </p>
                      </div>

                      <p style="text-align: center;">
                        Acesse seu memorial em | Access your memorial at:<br>
                        <a href="${memorialUrl}" 
                           style="color: #FF1493; 
                                  text-decoration: none;">
                          ${memorialUrl}
                        </a>
                      </p>

                      <p style="text-align: center;">
                        Compartilhe este QR code com seu amor para torná-lo ainda mais especial!<br>
                        Share this QR code with your loved one to make it even more special!
                      </p>

                      <div style="text-align: center; 
                                 margin-top: 40px; 
                                 padding-top: 20px; 
                                 border-top: 1px solid #eee;">
                        <p style="color: #666;">
                          Com amor | With love,<br>
                          Equipe Memoryys | Memoryys Team
                        </p>
                      </div>
                    </div>
                  </body>
                </html>
              `,
              Charset: "UTF-8",
            },
          },
        },
      },
    });

    console.log("Attempting to send email...");
    const response = await client.send(command);
    console.log("Email sent successfully:", response);

    return new Response(
      JSON.stringify({ success: true, messageId: response.MessageId }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});