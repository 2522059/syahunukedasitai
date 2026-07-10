const PLACES_TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

function getApiKey() {
    return process.env.GOOGLE_MAPS_API_KEY;
}

function mapPlace(place) {
    const location = place.location || {};

    return {
        googlePlaceId: place.id,
        name: place.displayName?.text || "",
        address: place.formattedAddress || "",
        category: place.primaryTypeDisplayName?.text || place.primaryType || "",
        latitude: location.latitude || null,
        longitude: location.longitude || null,
        googleMapsUri: place.googleMapsUri || ""
    };
}

async function searchPlaces(keyword) {
    const apiKey = getApiKey();

    if (!apiKey) {
        const error = new Error("GOOGLE_MAPS_API_KEYが未設定です");
        error.status = 500;
        throw error;
    }

    const response = await fetch(PLACES_TEXT_SEARCH_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": [
                "places.id",
                "places.displayName",
                "places.formattedAddress",
                "places.location",
                "places.primaryType",
                "places.primaryTypeDisplayName",
                "places.googleMapsUri"
            ].join(",")
        },
        body: JSON.stringify({
            textQuery: keyword,
            languageCode: "ja",
            regionCode: "JP"
        })
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error?.message || "Google Places API request failed");
        error.status = response.status;
        throw error;
    }

    return (data.places || []).map(mapPlace);
}

module.exports = {
    searchPlaces
};
