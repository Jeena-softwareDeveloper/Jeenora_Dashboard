import { allNav } from './allNav';

export const getNav = (role, permissions = [], menuDisplaySettings = {}) => {
  const finalNavs = []

  for (let i = 0; i < allNav.length; i++) {
    // Enable superadmin to see admin menus
    if (role === allNav[i].role || (role === 'superadmin' && allNav[i].role === 'admin')) {
      const item = allNav[i];

      // Superadmin bypasses permission checks
      if (role === 'superadmin') {
        finalNavs.push(item);
        continue;
      }

      // Check parent permission (if exists)
      let hasParentPermission = true;
      if (item.permission && (!permissions || !permissions.includes(item.permission))) {
        hasParentPermission = false;
      }

      // If it has children, filter them
      if (item.children && item.children.length > 0) {
        const filteredChildren = item.children.filter(child => {
          if (child.permission) {
            return permissions && permissions.includes(child.permission);
          }
          return true;
        });

        if (filteredChildren.length > 0) {
          // Get display mode for this specific menu group
          // Use menu ID or title as key
          const menuKey = item.id.toString();
          const displayMode = menuDisplaySettings[menuKey] || 'grouped';

          if (displayMode === 'flat') {
            // Add children directly without parent (flat mode)
            finalNavs.push(...filteredChildren);
          } else {
            // Add parent with children (grouped mode - default)
            finalNavs.push({
              ...item,
              children: filteredChildren
            });
          }
        }
      } else {
        // No children (single link)
        if (hasParentPermission) {
          finalNavs.push(item);
        }
      }
    }
  }
  return finalNavs;
}