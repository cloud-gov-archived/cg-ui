/***/
// API library for basic error handling and serialization
/***/
export async function getData(url) {
    try {
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            return data;
        } else {
            throw new Error(`an error occurred with response code ${res.status}`);
        }
    } catch (error) {
        throw new Error(error.message);
    }
};
