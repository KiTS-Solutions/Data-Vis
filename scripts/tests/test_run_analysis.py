import json
from pricing_pipeline.analyze_pricing import run_analysis


def test_run_analysis_writes_full_analytics_json(tmp_path):
    normalized = {
        "meta": {
            "client": "Stories",
            "own_brand": "Stories",
            "competitors": ["Espresso Lab", "Dunkin Donuts", "Joe & the Juice", "Starbucks"],
        },
        "records": [
            {"category": "Hot", "product": "Americano MEDIUM", "brand": "Stories", "price_lbp": 350000},
            {"category": "Hot", "product": "Americano MEDIUM", "brand": "Espresso Lab", "price_lbp": 400000},
            {"category": "Hot", "product": "Americano MEDIUM", "brand": "Joe & the Juice", "price_lbp": 358000},
            {"category": "Hot", "product": "Americano MEDIUM", "brand": "Starbucks", "price_lbp": 350000},
        ],
    }
    normalized_path = tmp_path / "normalized.json"
    normalized_path.write_text(json.dumps(normalized))
    output_path = tmp_path / "out" / "analytics.json"

    result = run_analysis(str(normalized_path), str(output_path))

    assert output_path.exists()
    assert result["meta"]["client"] == "Stories"
    assert len(result["products"]) == 1
    assert result["products"][0]["price_index"] == 94.8
    assert len(result["categories"]) == 1
    assert result["categories"][0]["category"] == "Hot"
