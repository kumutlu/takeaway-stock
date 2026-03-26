-- Minimal RLS policies for a small team
-- Apply after Prisma migrations. Adjust as needed.

alter table "User" enable row level security;
alter table "Supplier" enable row level security;
alter table "Brand" enable row level security;
alter table "Product" enable row level security;
alter table "StockMovement" enable row level security;
alter table "InventoryCheck" enable row level security;
alter table "OrderSuggestion" enable row level security;
alter table "AuditLog" enable row level security;
alter table "AppSetting" enable row level security;

create policy "read_write_auth" on "Product"
  for all using (auth.role() = 'authenticated');

create policy "read_write_auth" on "StockMovement"
  for all using (auth.role() = 'authenticated');

create policy "read_write_auth" on "Supplier"
  for all using (auth.role() = 'authenticated');

create policy "read_write_auth" on "Brand"
  for all using (auth.role() = 'authenticated');

create policy "read_write_auth" on "InventoryCheck"
  for all using (auth.role() = 'authenticated');

create policy "read_write_auth" on "OrderSuggestion"
  for all using (auth.role() = 'authenticated');

create policy "read_write_auth" on "AuditLog"
  for all using (auth.role() = 'authenticated');

create policy "read_write_auth" on "AppSetting"
  for all using (auth.role() = 'authenticated');

create policy "read_write_auth" on "User"
  for all using (auth.role() = 'authenticated');
