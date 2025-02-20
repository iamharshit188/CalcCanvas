# import torch
# from transformers import pipeline, BitsAndBytesConfig, AutoProcessor, LlavaForConditionalGeneration
# from PIL import Image

# # quantization_config = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.float16)
# quantization_config = BitsAndBytesConfig(
#     load_in_4bit=True,
#     bnb_4bit_compute_dtype=torch.float16
# )


# model_id = "llava-hf/llava-1.5-7b-hf"
# processor = AutoProcessor.from_pretrained(model_id)
# model = LlavaForConditionalGeneration.from_pretrained(model_id, quantization_config=quantization_config, device_map="auto")
# # pipe = pipeline("image-to-text", model=model_id, model_kwargs={"quantization_config": quantization_config})

# def analyze_image(image: Image):
#     prompt = "USER: <image>\nAnalyze the equation or expression in this image, and return answer in format: {expr: given equation in LaTeX format, result: calculated answer}"

#     inputs = processor(prompt, images=[image], padding=True, return_tensors="pt").to("cuda")
#     for k, v in inputs.items():
#         print(k,v.shape)

#     output = model.generate(**inputs, max_new_tokens=20)
#     generated_text = processor.batch_decode(output, skip_special_tokens=True)
#     for text in generated_text:
#         print(text.split("ASSISTANT:")[-1])

import google.generativeai as genai
import ast
import json
from PIL import Image
from constants import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

def analyze_image(img: Image, dict_of_vars: dict):
    try:
        model = genai.GenerativeModel(model_name="gemini-2.0-flash")  # Changed to pro-vision
        dict_of_vars_str = json.dumps(dict_of_vars, ensure_ascii=False)
        
        prompt = (
            "You are a mathematical expression interpreter. Look at this image and tell me what mathematical expression it contains. "
            "Return the answer in this exact format (a list with one dictionary): "
            "[{'expr': 'the_expression_in_latex', 'result': 'the_calculated_result'}]. "
            "For example, if you see '2+2', return: [{'expr': '2+2', 'result': '4'}]. "
            "Make sure to use LaTeX formatting for mathematical expressions. "
            f"Use these variables if needed: {dict_of_vars_str}"
        )
        
        response = model.generate_content([prompt, img])
        print("Gemini Response:", response.text)
        
        # Parse the response
        try:
            answers = ast.literal_eval(response.text)
            if isinstance(answers, list) and len(answers) > 0:
                for answer in answers:
                    answer['assign'] = answer.get('assign', False)
                return answers
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            # Fallback response if parsing fails
            return [{"expr": response.text, "result": "Error parsing result", "assign": False}]
            
    except Exception as e:
        print(f"Error in analyze_image: {e}")
        return [{"expr": "Error", "result": str(e), "assign": False}]