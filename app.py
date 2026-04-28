import gradio as gr
from backend.ai.embedding import get_embedding, cosine_similarity

def compare(img1, img2):
    emb1 = get_embedding(img1)
    emb2 = get_embedding(img2)
    score = cosine_similarity(emb1, emb2)
    return f"Similarity: {score:.4f}"

interface = gr.Interface(
    fn=compare,
    inputs=[gr.Image(type="filepath"), gr.Image(type="filepath")],
    outputs="text"
)

interface.launch()