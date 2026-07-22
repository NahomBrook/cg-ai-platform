-- Enable Row Level Security on all tenant-isolated tables
ALTER TABLE tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_voice_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_subscription ENABLE ROW LEVEL SECURITY;

-- Create session-based tenant isolation policies using app.current_tenant_id

-- 1. Tenant
DROP POLICY IF EXISTS tenant_isolation_policy ON tenant;
CREATE POLICY tenant_isolation_policy ON tenant
  USING (id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- 2. AppUser
DROP POLICY IF EXISTS app_user_isolation_policy ON app_user;
CREATE POLICY app_user_isolation_policy ON app_user
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- 3. SocialAccount
DROP POLICY IF EXISTS social_account_isolation_policy ON social_account;
CREATE POLICY social_account_isolation_policy ON social_account
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- 4. BrandVoiceProfile
DROP POLICY IF EXISTS brand_voice_profile_isolation_policy ON brand_voice_profile;
CREATE POLICY brand_voice_profile_isolation_policy ON brand_voice_profile
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- 5. ContentItem
DROP POLICY IF EXISTS content_item_isolation_policy ON content_item;
CREATE POLICY content_item_isolation_policy ON content_item
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- 6. ApprovalLog (via ContentItem link)
DROP POLICY IF EXISTS approval_log_isolation_policy ON approval_log;
CREATE POLICY approval_log_isolation_policy ON approval_log
  USING (
    content_item_id IN (
      SELECT id FROM content_item 
      WHERE tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    )
  );

-- 7. AnalyticsSnapshot (via ContentItem link)
DROP POLICY IF EXISTS analytics_snapshot_isolation_policy ON analytics_snapshot;
CREATE POLICY analytics_snapshot_isolation_policy ON analytics_snapshot
  USING (
    content_item_id IN (
      SELECT id FROM content_item 
      WHERE tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    )
  );

-- 8. Recommendation
DROP POLICY IF EXISTS recommendation_isolation_policy ON recommendation;
CREATE POLICY recommendation_isolation_policy ON recommendation
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- 9. BillingSubscription
DROP POLICY IF EXISTS billing_subscription_isolation_policy ON billing_subscription;
CREATE POLICY billing_subscription_isolation_policy ON billing_subscription
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);