import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const userApi = "http://localhost:3000/api/v1/users/";
export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: userApi,
        credentials: 'include'
    }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (inputData) => ({
                url: "register",
                method: "POST",
                body: inputData,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }),

        loginUser: builder.mutation({
            query: (inputData) => ({
                url: "login",
                method: "POST",
                body: inputData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
            onQueryStarted: async (args, {queryFulfilled, dispatch}) => {
                try {
                    
                } catch (error) {
                    
                }
            }
        })


    })
})
