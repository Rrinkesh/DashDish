const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ success: false, message: "Forbidden: No role assigned" });
        }

        // Check if user's role is in the array of allowed roles
        // We also consider 'admin' as a generic SUPER_ADMIN for backwards compatibility
        const userRole = req.user.role;
        const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'admin';
        
        // Super Admins can access everything if we want, or strictly follow the roles array
        if (roles.includes(userRole) || isSuperAdmin) {
            next();
        } else {
            return res.status(403).json({ success: false, message: `Forbidden: Requires one of these roles: ${roles.join(', ')}` });
        }
    };
};

module.exports = { authorizeRoles };
