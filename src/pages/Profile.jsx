import { useTranslation } from "react-i18next";
import { getCurrentUser } from "../lib/auth";

const Profile = () => {
  const { t } = useTranslation();
  const user = getCurrentUser();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-border p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primaryCobalt to-accentGold flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {user?.user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-ink">Profile & Settings</h1>
            <p className="text-textSecondary mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* User Info Card */}
          <div className="border border-border rounded-lg p-6 bg-neutralBg">
            <h2 className="text-lg font-semibold text-ink mb-4">
              Account Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-textSecondary block mb-1">
                  Name
                </label>
                <p className="text-ink font-medium">
                  {user?.user?.name || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-textSecondary block mb-1">
                  Email
                </label>
                <p className="text-ink font-medium">
                  {user?.user?.email || "N/A"}
                </p>
              </div>
              {user?.user?.role && (
                <div>
                  <label className="text-sm font-medium text-textSecondary block mb-1">
                    Role
                  </label>
                  <p className="text-ink font-medium capitalize">
                    {user.user.role}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Settings Card */}
          <div className="border border-border rounded-lg p-6 bg-neutralBg">
            <h2 className="text-lg font-semibold text-ink mb-4">Settings</h2>
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4 text-center bg-white">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primaryCobalt/10 flex items-center justify-center">
                  <span className="text-3xl">🚧</span>
                </div>
                <h3 className="font-semibold text-ink mb-1">Coming Soon</h3>
                <p className="text-sm text-textSecondary">
                  Profile editing and additional settings will be available
                  soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
