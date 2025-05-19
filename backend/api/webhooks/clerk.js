import { Webhook } from "svix";
import connectDB from "../../config/mongodb.js";
import User from "../../models/UserModel.js";

export async function POST(req) {
  // You need to get the raw body for verification
  const payload = await req.text();
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the Webhook signing secret from your Clerk dashboard
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(
      "WEBHOOK_SECRET environment variable is not set. Please configure it in your .env file."
    );
    return new Response("Error occured -- no webhook secret", {
      status: 500,
    });
  }

  // Verify the webhook signature
  const wh = new Webhook(webhookSecret);

  let evt;

  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Webhook verification error:", err);
    return new Response("Error occured -- invalid payload", {
      status: 400,
    });
  }

  const { data } = evt;
  const eventType = evt.type;

  // Prepare the user data to save in the database
  const userData = {
    _id: data.id,
    email: data.email_addresses[0]?.email_address,
    name: `${data.first_name} ${data.last_name}`,
    image: data.image_url,
  };

  await connectDB();

  switch (eventType) {
    case "user.created":
      try {
        const newUser = await User.create(userData);
      } catch (error) {
        console.error("Error creating user:", error);
      }
      break;
    case "user.updated":
      try {
        const updatedUser = await User.findByIdAndUpdate(data.id, userData, {
          new: true,
        });
      } catch (error) {
        console.error("Error updating user:", error);
      }
      break;
    case "user.deleted":
      try {
        await User.findByIdAndDelete(data.id);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
      break;
    default:
      console.log(`Unhandled event type: ${eventType}`);
  }

  return new Response(null, { status: 200 });
}
