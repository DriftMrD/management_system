-- 将 admin 账号邮箱改为 admin@transsion.com
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@admin.com';

  IF admin_id IS NULL THEN
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@transsion.com') THEN
      RETURN;
    END IF;
    RAISE EXCEPTION 'Admin user not found';
  END IF;

  UPDATE auth.users
  SET email = 'admin@transsion.com'
  WHERE id = admin_id;

  UPDATE auth.identities
  SET identity_data = jsonb_build_object('sub', admin_id::text, 'email', 'admin@transsion.com')
  WHERE user_id = admin_id AND provider = 'email';

  UPDATE public.profiles
  SET email = 'admin@transsion.com'
  WHERE id = admin_id;
END $$;
