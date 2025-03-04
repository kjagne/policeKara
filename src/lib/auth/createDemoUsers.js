// This file is for reference only - it would be run as a Supabase Edge Function

import { createClient } from "@supabase/supabase-js";

// This would be deployed as a Supabase Edge Function
export async function createDemoUsers(event) {
  const { adminEmail, officerEmail, analystEmail, password } = JSON.parse(
    event.body,
  );

  // Initialize Supabase admin client
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  try {
    // Create admin user
    const { data: adminData, error: adminError } =
      await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: password,
        email_confirm: true,
      });

    if (adminError) throw adminError;

    // Create profile for admin
    await supabaseAdmin.from("profiles").insert({
      id: adminData.user.id,
      role: "admin",
    });

    // Create officer user
    const { data: officerData, error: officerError } =
      await supabaseAdmin.auth.admin.createUser({
        email: officerEmail,
        password: password,
        email_confirm: true,
      });

    if (officerError) throw officerError;

    // Create profile for officer
    await supabaseAdmin.from("profiles").insert({
      id: officerData.user.id,
      role: "officer",
    });

    // Create analyst user
    const { data: analystData, error: analystError } =
      await supabaseAdmin.auth.admin.createUser({
        email: analystEmail,
        password: password,
        email_confirm: true,
      });

    if (analystError) throw analystError;

    // Create profile for analyst
    await supabaseAdmin.from("profiles").insert({
      id: analystData.user.id,
      role: "analyst",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Demo users created successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
