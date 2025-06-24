import logging
import azure.functions as func
import pandas as pd
import io
import json

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        file = req.files.get('file')
        if not file:
            return func.HttpResponse(
                json.dumps({ "error": "No file uploaded" }),
                mimetype="application/json",
                status_code=400
            )

        in_memory_file = io.BytesIO(file.read())
        df = pd.read_excel(in_memory_file)

        # Optional filtering logic
        if 'Status' in df.columns:
            filtered = df[df['Status'] == 'Active']
        else:
            filtered = df

        result_json = filtered.to_json(orient='records')

        return func.HttpResponse(
            result_json,
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:
        logging.exception("Error processing Excel file")
        return func.HttpResponse(
            json.dumps({ "error": str(e) }),
            mimetype="application/json",
            status_code=500
        )
