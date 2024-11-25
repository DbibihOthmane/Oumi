import axios from "axios";



const api = axios.create({
    baseURL: 'http://localhost:8082',
});










export  const fetchBankAccounts  = async () => {
  const response = await api.get('/banque/comptes');
  return response.data;
}

export const createCompte = async (accountData) => {
  try {
    const response = await api.post('/banque/comptes', accountData);
    return response.data;
  } catch (err) {
    throw new Error("Failed to create the account. Please try again later.");
  }
};











export const updateBankAccount = async (id, compteDetails, format = "xml") => {
  try {
    console.log("Sending details:", compteDetails);

    // Determine content type and expected response format based on the selected option
    const headers = {
      "Content-Type": "application/json", // Sending JSON
      Accept: format === "xml" ? "application/xml" : "application/json", // Response format
    };

    const response = await api.put(
      `/banque/comptes/${id}`, // Replace with your API URL
      compteDetails,
      { headers }
    );

    console.log(`Received ${format.toUpperCase()} response:`, response.data);

    return response.data; // This will be the raw response (XML or JSON)
  } catch (error) {
    console.error("Error updating compte:", error);
    throw error;
  }
};




export const deleteBankAccount = async (id) => {
  try {
    const response = await api.delete(`/banque/comptes/${id}`);
    console.log("Deleted Compte:", response.status);
    return response.status;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error("Compte not found");
    } else {
      console.error("Error deleting compte:", error.message);
    }
    throw error;
  }
};


