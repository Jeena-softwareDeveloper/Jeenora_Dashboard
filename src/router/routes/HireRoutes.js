import { lazy } from "react";   
const HireRegister = lazy(()=> import('./../../views/auth/HireRegister'))
export const HireRoutes = [

    {
        path: '/Hire/hireregister',
        element : <HireRegister/>,
        role : 'hireuser',
        status : 'active'
    },
]