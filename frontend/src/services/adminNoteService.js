
import api from "./api";

const adminNoteService = {
  // Fetch all notes, including unpublished drafts
  getAllNotes: async () => {
    const response = await api.get("/notes/admin");
    return response.data;
  },

  // Upload a PDF and its metadata
  uploadNote: async (formData) => {
    const response = await api.post("/notes", formData);
    return response.data;
  },

  // Publish or unpublish a note
  togglePublish: async (noteId) => {
    const response = await api.patch(
      `/notes/${noteId}/publish`
    );
    return response.data;
  },

  // Delete a note and its PDF
  deleteNote: async (noteId) => {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  },
};

export default adminNoteService;
