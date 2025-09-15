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

export const createRoom = async (roomDetails: { name: string; description: string; category: string; subject: string; user_id: string }) => {
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

export const getRoomById = async (id: string) => {
  try {
    const res = await fetch(`/api/room/get_room/${id}`, {
      method: "GET",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server error: ${res.status} - ${errorText}`);
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.error("❌ Fetching room failed", err);
    return { success: false, error: (err as Error).message ?? "Unknown error" };
  }
};

export const uploadPdfToRoom = async (room_id: string, file_name: string, size: number, user_id: string, time: string) => {
    try {
        const res = await fetch(`/api/pdf/get_pdfs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ room_id, file_name, size, user_id, time })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Server error: ${res.status} - ${errorText}`);
        }

        const data = await res.json();

        return data;
    } catch (err) {
        console.error("❌ Uploading PDF failed", err);
        return { success: false, error: (err as Error).message ?? "Unknown error" };
    }
};

export const deleteRoom = async (id: string) => {
    try {
        const res = await fetch(`/api/room/delete_room/${id}`, {
            method: "DELETE",
        }); 
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Server error: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("❌ Deleting room failed", err);
        return { success: false, error: (err as Error).message ?? "Unknown error" };
    }
};