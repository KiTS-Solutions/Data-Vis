def is_category_header_row(row: tuple) -> bool:
    product = row[0]
    rest = row[1:8]
    return product is not None and all(v is None for v in rest)
