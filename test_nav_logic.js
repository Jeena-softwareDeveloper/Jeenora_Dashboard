const allNav = [
    {
        id: 54,
        title: 'Hire',
        icon: 'icon',
        role: 'seller',
        children: [
            {
                id: 177,
                title: 'Resume',
                icon: 'icon',
                path: '/hire/resume',
                permission: 'hire.resume',
                description: 'Promotional hire'
            },
            {
                id: 178,
                title: 'Users List',
                icon: 'icon',
                path: '/seller/hire/users',
                permission: 'hire.users', // USER HAS THIS
                description: 'List of all hire users'
            },
        ]
    },
    {
        id: 9,
        title: 'Dashboard',
        icon: 'icon',
        role: 'seller',
        path: '/seller/dashboard',
        permission: 'dashboard.access' // USER DOES NOT HAVE THIS
    }
];

const getNav = (role, permissions = []) => {
    const finalNavs = []

    for (let i = 0; i < allNav.length; i++) {
        if (role === allNav[i].role) {
            const item = allNav[i];

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
                    console.log(`Adding parent ${item.title} with ${filteredChildren.length} children`);
                    finalNavs.push({
                        ...item,
                        children: filteredChildren
                    });
                } else {
                    console.log(`Parent ${item.title} has no allowed children`);
                }
            } else {
                // No children (single link)
                if (hasParentPermission) {
                    console.log(`Adding item ${item.title}`);
                    finalNavs.push(item);
                } else {
                    console.log(`Skipping item ${item.title} due to missing permission`);
                }
            }
        }
    }
    return finalNavs;
}

const role = 'seller';
const permissions = ['hire.users', 'hire.resumes'];

console.log("Testing getNav with permissions:", permissions);
const result = getNav(role, permissions);
console.log("Resulting Nav:", JSON.stringify(result, null, 2));

if (result.find(r => r.title === 'Hire')) {
    console.log("SUCCESS: Hire menu is present.");
} else {
    console.log("FAILURE: Hire menu is missing.");
}
