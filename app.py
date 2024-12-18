from flask import Flask, render_template, request
from math import comb

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    step = 0
    total_horses = None
    excluded_horses = []
    confidence = None
    expected_value = None

    if request.method == 'POST':
        step = int(request.form.get('step', 0))

        if step == 0:
            total_horses = int(request.form.get('total_horses', 0))
            step = 1

        elif step == 1:
            total_horses = int(request.form.get('total_horses', 0))
            excluded_horses = request.form.getlist('excluded_horses')
            confidence = float(request.form.get('confidence', 0)) / 100.0

            k = len(excluded_horses)
            if total_horses >= k + 3:
                total_comb_all = comb(total_horses, 3)
                total_comb_reduced = comb(total_horses - k, 3)
                ev_success = (0.75 * total_comb_all) / total_comb_reduced
                expected_value = round(confidence * ev_success, 3)
            else:
                expected_value = 0

    return render_template(
        'index.html',
        step=step,
        total_horses=total_horses,
        excluded_horses=excluded_horses,
        confidence=(confidence * 100 if confidence else None),
        expected_value=expected_value,
        comb=comb
    )

if __name__ == '__main__':
    app.run(debug=True)
