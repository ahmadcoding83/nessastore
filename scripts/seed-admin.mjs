import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.admin", override: false });
loadEnv({ path: ".env", override: false });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;

if (!supabaseUrl || !serviceRoleKey || !adminEmail) {
  console.error("Missing env. Required: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (usersError) throw usersError;

  const targetUser = usersData.users.find(
    (user) => (user.email || "").toLowerCase() === adminEmail.toLowerCase()
  );

  if (!targetUser || !targetUser.email) {
    throw new Error("User with email " + adminEmail + " not found in auth.users");
  }

  const { error: upsertError } = await supabase.from("users").upsert({
    id: targetUser.id,
    email: targetUser.email,
    role: "admin"
  });

  if (upsertError) throw upsertError;
  console.log("Success: " + targetUser.email + " is now admin.");
}

main().catch((error) => {
  console.error("Failed to seed admin:", error.message || error);
  process.exit(1);
});
