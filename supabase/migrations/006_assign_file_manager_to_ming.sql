-- 将 ming.cheng@transsion.com 所属产品改为「文件管理」
UPDATE public.profiles
SET product_id = (SELECT id FROM public.products WHERE code = 'file_manager')
WHERE email = 'ming.cheng@transsion.com';
