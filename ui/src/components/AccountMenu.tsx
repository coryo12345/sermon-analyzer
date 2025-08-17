import { getApiClient } from "../lib/api";
import { Dropdown } from "./Dropdown";

interface AccountMenuProps {
  className?: string;
}

export function AccountMenu({ className = "" }: AccountMenuProps) {
  const client = getApiClient();
  const user = client.authStore.record;

  const logout = () => {
    client.authStore.clear();
    window.location.href = "/login";
  };

  const handleManageAccount = () => {
    window.location.href = "/account";
  };

  const menuItems = [
    {
      key: "user-email",
      label: user?.email || "User",
      className: "font-medium"
    },
    {
      key: "divider",
      label: "---",
      className: "border-t border-surface-300 dark:border-surface-600 my-1"
    },
    {
      key: "manage-account",
      label: "Manage Account",
      onClick: handleManageAccount
    },
    {
      key: "logout",
      label: "Sign Out",
      onClick: logout
    }
  ];

  return (
    <div className={className}>
      <Dropdown
        items={menuItems}
        placement="bottom-end"
        className="!w-8 !h-8 !min-w-0 !p-0 !m-0 !rounded-full !bg-surface-700 hover:!bg-surface-600 !border !border-surface-600"
        menuClassName="w-56"
        showChevron={false}
      >
        <svg className="w-5 h-5 text-surface-100" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </Dropdown>
    </div>
  );
}