-- 修复 admin 账号登录问题（删除错误记录并重新创建）
-- 在 Supabase Dashboard → SQL Editor 中执行
-- 登录: admin@transsion.com 或 admin，密码: admin

DO $$
DECLARE
  admin_user_id uuid := 'a0000000-0000-4000-8000-000000000001';
BEGIN
  DELETE FROM auth.identities WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'admin@transsion.com'
  );
  DELETE FROM public.profiles WHERE email = 'admin@transsion.com';
  DELETE FROM auth.users WHERE email = 'admin@transsion.com';

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    email_change_token_current,
    recovery_token,
    phone_change,
    phone_change_token,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_user_id,
    'authenticated',
    'authenticated',
    'admin@transsion.com',
    crypt('admin', gen_salt('bf')),
    now(),
    '', '', '', '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"admin"}'::jsonb,
    now(),
    now()
  );

  INSERT INTO auth.identities (
    id,
    user_id,
    provider,
    provider_id,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    admin_user_id,
    'email',
    admin_user_id::text,
    jsonb_build_object('sub', admin_user_id::text, 'email', 'admin@transsion.com'),
    now(),
    now(),
    now()
  );

  INSERT INTO public.profiles (id, email, full_name, role, product_id)
  VALUES (admin_user_id, 'admin@transsion.com', 'admin', 'project_manager', NULL)
  ON CONFLICT (id) DO UPDATE
  SET role = 'project_manager', full_name = 'admin', product_id = NULL;
END $$;
