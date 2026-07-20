def group_records_by_product(records: list) -> dict:
    grouped = {}
    for r in records:
        key = (r["category"], r["product"])
        grouped.setdefault(key, {})[r["brand"]] = r["price_lbp"]
    return grouped


def compute_competitor_average(prices: dict, own_brand: str, competitors: list):
    values = [prices[c] for c in competitors if prices.get(c) is not None]
    if not values:
        return None
    return sum(values) / len(values)


def compute_price_index(own_price, competitor_avg):
    if own_price is None or competitor_avg is None or competitor_avg == 0:
        return None
    return round((own_price / competitor_avg) * 100, 1)


def comparability_flag(num_competitors_priced: int) -> str:
    if num_competitors_priced >= 3:
        return "high"
    if num_competitors_priced == 2:
        return "medium"
    return "low"


def build_product_analytics(records: list, own_brand: str, competitors: list) -> list:
    grouped = group_records_by_product(records)
    products = []
    for (category, product), prices in grouped.items():
        own_price = prices.get(own_brand)
        competitor_avg = compute_competitor_average(prices, own_brand, competitors)
        num_priced = sum(1 for c in competitors if prices.get(c) is not None)
        products.append({
            "category": category,
            "product": product,
            "prices_lbp": prices,
            "own_price_lbp": own_price,
            "competitor_avg_lbp": round(competitor_avg, 2) if competitor_avg is not None else None,
            "price_index": compute_price_index(own_price, competitor_avg),
            "comparability": comparability_flag(num_priced),
        })
    return products


def build_category_rollups(products: list) -> list:
    by_category = {}
    for p in products:
        by_category.setdefault(p["category"], []).append(p)

    rollups = []
    for category, items in by_category.items():
        countable = [p for p in items if p["comparability"] in ("high", "medium") and p["price_index"] is not None]
        avg_index = round(sum(p["price_index"] for p in countable) / len(countable), 1) if countable else None
        rollups.append({
            "category": category,
            "product_count": len(items),
            "countable_product_count": len(countable),
            "avg_price_index": avg_index,
        })
    return rollups
