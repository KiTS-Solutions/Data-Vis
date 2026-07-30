from pricing_pipeline.parse_pricing import is_category_header_row


def test_category_header_row_detected():
    row = ("Black Coffee", None, None, None, None, None, None, None, None, None)
    assert is_category_header_row(row) is True


def test_product_row_not_detected_as_header():
    row = ("Double Espresso Macchiato", 300000, "-", "-", "-", "-", 300000, 0, None, None)
    assert is_category_header_row(row) is False


def test_column_header_row_not_detected_as_category():
    row = ("Products Competitors", "Stories ", "Espresso Lab", "Dunkin Donuts",
           "Joe & the Juice", "Starbucks ", "Average", "Difference", None, None)
    assert is_category_header_row(row) is False


def test_empty_row_not_detected_as_category():
    row = (None,) * 10
    assert is_category_header_row(row) is False


def test_product_priced_only_past_the_default_window_not_detected_as_header():
    """A product with a price in column 8 (a 5th brand, past the default
    7-column check window) must not be misread as a category header just
    because columns 1-7 happen to be empty for it."""
    row = ("Grilled Veggie Salad", None, None, None, None, None, None, None, 1074000, 1074000, None)
    assert is_category_header_row(row, brand_span_end=9) is False
    # With the default window (mirrors legacy 7-column sheets) it still reads as a header —
    # brand_span_end must be passed as the real Average-column index for wider sheets.
    assert is_category_header_row(row) is True
