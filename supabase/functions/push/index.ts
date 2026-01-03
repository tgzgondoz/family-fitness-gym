import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const payload = await req.json();
    const { record } = payload;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, // Automatically provided
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // Automatically provided
    );

    // 1. Fetch the recipient's push token
    const { data: user } = await supabase
      .from("users")
      .select("expo_push_token")
      .eq("id", record.user_id)
      .single();

    if (!user?.expo_push_token) {
      return new Response("User has no push token", { status: 200 });
    }

    // 2. Send the Push Notification via Expo
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: user.expo_push_token,
        title: record.title || "RecruitAI Update",
        body: record.message,
        sound: "default",
        priority: "high",
        data: {
          type: record.type,
          screen:
            record.type === "subscription_alert" ? "Subscription" : "Main",
        },
      }),
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
});
