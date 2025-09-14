export const getAllRooms = async() => {
    try{
        const res = await fetch("/api/room/get_all_rooms",{
            method: "GET"
        });

        if(!res.ok){
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        return data;
    }
    catch(err){
        console.error("❌ Fetching rooms failed", err);
        return { success: false, error: (err as Error).message };
    }
}

export const createRoom = async (roomDetails: { name: string; description: string; category: string; subject: string; }) => {
    try {
        const res = await fetch("/api/room/create_room", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(roomDetails)
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("❌ Creating room failed", err);
        return { success: false, error: (err as Error).message };
    }
}