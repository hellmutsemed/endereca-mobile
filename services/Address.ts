import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";
import { Address } from "@/interfaces/Address";
import { getAddressesOffline, registerAddressOffline, searchAddressesOffline, searchFilteredAddressesOffline } from "@/database/offlineDatabase";

async function getTokenHeader() {
    const token = await AsyncStorage.getItem("token");
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    return config;
}

function formatResult(result: Object[]) {
    const formattedResult = result.map((address: any) => ({
        location: {
          type: "Point",
          coordinates: [address.longitude, address.latitude]
        },
        _id: address._id,
        name: address.name || undefined,
        locationType: address.locationType,
        createdBy: {
          _id: address.createdBy,
          name: address.createdByName,
        },
        project: address.project,
        observations: address.observations || undefined,
        plusCode: address.plusCode,
        createdAt: address.createdAt
    }));

    return formattedResult;
}

export async function getAddresses(isOffline: boolean) {
    if(isOffline) {
        try {
            const result: any = await getAddressesOffline();
            return formatResult(result);
        }
        catch(error){
            console.log(error);
            return null;
        }
    }
    else {
        try {
            const result = await api.get("/addresses", await getTokenHeader());
            return result.data;
        }
        catch(error){
            console.log(error);
            return null;
        }
    }
}

export async function searchAddresses(searchString: string, isOffline: boolean) {
    if(isOffline) {
        try {
            const result: any = await searchAddressesOffline(searchString);
      
            return formatResult(result);
          } catch (error) {
            console.log(error);
            return null;
        }
    }
    else {
        try {
            const result = await api.get(`/addresses/search?searchString=${searchString}`, await getTokenHeader());
            return result.data;
        }
        catch(error){
            console.log(error);
            return null;
        }
    }
}

export async function filterAddresses(searchParams: object, isOffline: boolean) {
    if(isOffline) {
        try{
            const result: any = await searchFilteredAddressesOffline(searchParams);
      
            return formatResult(result);
          } catch (error) {
            console.log(error);
            return null;
        }
    }
    else {
        let searchString = "/addresses/filtered_search?";
    
        const params = new URLSearchParams();

        for (const [key, value] of Object.entries(searchParams)) {
            params.append(key, value);
        }

        searchString += params.toString();

        try {
            const result = await api.get(searchString, await getTokenHeader());
            return result.data;
        }
        catch(error) {
            console.log(error);
            return null;
        }
    }
}

export async function registerAddress(address: Address, isOffline: boolean) {
    if(isOffline) {
        const result: any = await registerAddressOffline(address);
        return {}; //gambiarra braba, não estou orgulhoso. Isso serve para que o toast dê um feedback positivo.
    }
    else {
        if(!address) return null;

        try {
            const result = await api.post("/addresses", address, await getTokenHeader());
            return result.data;
        }
        catch(error) {
            console.log(error);
            return null;
        }
    }
}

export async function getOneAddress(addressId: string) {
    if(!addressId) return null;

    try {
        const result = await api.get(`/addresses/${addressId}`, await getTokenHeader());
        return result.data;
    }
    catch(error) {
        console.log(error);
        return null;
    }
}

export async function deleteOneAddress(addressId: string) {
    if(!addressId) return null;

    try {
        const result = await api.delete(`/addresses/${addressId}`, await getTokenHeader());
        return result.data;
    }
    catch(error) {
        console.log(error);
        return null;
    }
}