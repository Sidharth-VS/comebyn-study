export const getToken = async () => {
    try{
        const res = await fetch("/api/auth/token",{
            credentials: "include",
        });

        const { token } = await res.json();

        return token;
    }
    catch(error){
        console.log("Error while fetching token",error);
    }
}