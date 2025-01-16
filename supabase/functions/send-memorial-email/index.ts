import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SESv2Client, SendEmailCommand } from "npm:@aws-sdk/client-sesv2";

const AWS_ACCESS_KEY_ID = Deno.env.get("AWS_ACCESS_KEY_ID");
const AWS_SECRET_ACCESS_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  memorialUrl: string;
  qrCodeUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting email sending process...");

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      throw new Error("AWS credentials are missing");
    }

    const emailRequest: EmailRequest = await req.json();
    console.log("Received request data:", emailRequest);

    const client = new SESv2Client({
      region: "sa-east-1",
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log("Preparing to send email via SES...");

    const command = new SendEmailCommand({
      FromEmailAddress: "contact@memoryys.com",
      Destination: {
        ToAddresses: [emailRequest.to],
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
                        <img src="${emailRequest.qrCodeUrl}" 
                             alt="QR Code" 
                             style="max-width: 200px; height: auto;">
                        
                        <p>
                          <a href="${emailRequest.qrCodeUrl}" 
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
                        <a href="${emailRequest.memorialUrl}" 
                           style="color: #FF1493; 
                                  text-decoration: none;">
                          ${emailRequest.memorialUrl}
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

    console.log("Attempting to send email via SES...");
    const response = await client.send(command);
    console.log("SES Response:", response);

    return new Response(JSON.stringify({ success: true, messageId: response.MessageId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);