import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../api";

/**
 * Custom hook for image suggestion functionality
 * Manages image state, suggestions, and related operations
 * @param {string} productName - The product name to fetch suggestions for
 * @returns {object} Image suggestion state and functions
 */
export const useImageSuggestion = (productName) => {
  const [image, setImage] = useState("");
  const [suggested, setSuggested] = useState(null); // { imageUrl, creditText, creditUrl }
  const [suggestions, setSuggestions] = useState([]);
  const [suggestIndex, setSuggestIndex] = useState(0);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [imageLocked, setImageLocked] = useState(false);
  const debounceRef = useRef(null);

  // call backend suggestion endpoint
  const fetchSuggestedImage = async (query, showToastOnError = false) => {
    const q = String(query || "").trim();
    if (!q) return;

    try {
      setIsSuggesting(true);
      const res = await api.get("/api/images/suggest", { params: { query: q } });

      const results = res.data?.results || [];
      setSuggestions(results);
      setSuggestIndex(0);

      if (results.length > 0) {
        // Set the suggested image to the first result
        setSuggested(results[0]);
        // Auto-fill ONLY if user hasn't typed their own URL
        if (!imageLocked && !image.trim()) {
          setImage(results[0].imageUrl);
        }
      } else {
        setSuggested(null);
      }
    } catch (err) {
      setSuggestions([]);
      setSuggestIndex(0);
      setSuggested(null);
      if (showToastOnError) toast.error("Could not find suggested images.");
    } finally {
      setIsSuggesting(false);
    }
  };

  // debounce suggestion while typing name if image not manually set
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!productName?.trim() || imageLocked) return;

    debounceRef.current = setTimeout(() => {
      fetchSuggestedImage(productName);
    }, 700);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productName, imageLocked]);

  const chooseSuggestion = (idx) => {
    const chosen = suggestions[idx];
    if (!chosen) return;
    setSuggestIndex(idx);
    setSuggested(chosen);
    setImage(chosen.imageUrl);
    setImageLocked(true);
  };

  const clearImage = () => {
    setImage("");
    setImageLocked(false);
    if (productName?.trim()) fetchSuggestedImage(productName);
  };

  return {
    image,
    setImage,
    imageLocked,
    setImageLocked,
    suggested,
    suggestions,
    suggestIndex,
    isSuggesting,
    fetchSuggestedImage,
    chooseSuggestion,
    clearImage,
  };
};
