---
toc: true
theme: dashboard
title: Investor accreditation
---

<script
  src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
  integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg=="
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
></script>
<script src="https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js"></script>

<style>
.form-section {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.input-container {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
}

.input-container label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.checkbox-group {
  margin: 1.5rem 0;
}

.checkbox-container {
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
}

.checkbox-container input[type="checkbox"] {
  margin-right: 0.5rem;
}

.signature-field {
  width: 100%;
  height: 200px;
  border: 1px solid #000;
  background: white;
  touch-action: none;
  margin: 1rem 0;
}

.button-container {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
}

button {
  background: #0066cc;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background: #0052a3;
}

#investorForm {
  width: 595.28pt;
  margin: 0 auto;
  padding: 36pt;
  box-sizing: border-box;
}

.pdf-content {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style>

# Accredited Investor Certification Form

Investment in the United States is highly regulated. The SEC says that not everyone can be an accredited investor. As I'm starting to dabble in angel investment, I thought I would create this form to help speed up providing documentation to companies for whom I'm investing, and help them stay compliant.

<div class="note">

## How can individuals qualify as accredited?

Individuals (i.e., natural persons) may qualify as accredited investors based on wealth and income thresholds, as well as other measures of financial sophistication.

## Financial Criteria

- Net worth over $1 million, excluding primary residence (individually or with spouse or partner); OR
- Income over $200,000 (individually) or $300,000 (with spouse or partner) in each of the prior two years, with a reasonable expectation for the same for the current year.

## Professional Criteria

- Investment professionals holding certain securities licenses
- Directors/executive officers of the company selling the securities
- Certain “family offices” and their clients
- “Knowledgeable employees” of a private fund

## Resources

1. U.S. Securities and Exchange Commission. **"Accredited Investor."** _SEC._ [https://www.sec.gov/education/capitalraising/building-blocks/accredited-investor](https://www.sec.gov/education/capitalraising/building-blocks/accredited-investor)
2. U.S. Securities and Exchange Commission. **"Accredited Investors – Updated Investor Bulletin."** _Investor.gov._ [https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/updated-3](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/updated-3)
3. Electronic Code of Federal Regulations. **"$230.501 Definitions and Terms Used in Regulation D."** _eCFR._ [https://www.ecfr.gov/current/title-17/chapter-II/part-230/subject-group-ECFR6e651a4c86c0174/section-230.501](https://www.ecfr.gov/current/title-17/chapter-II/part-230/subject-group-ECFR6e651a4c86c0174/section-230.501)

</div>

```js
// Wait for DOM to be loaded
document.addEventListener("DOMContentLoaded", () => {
  // Input creation functions
  function createLabeledInput(labelText, inputType = "text", required = true) {
    const container = document.createElement("div");
    container.className = "input-container";

    const label = document.createElement("label");
    label.textContent = labelText;

    const input = document.createElement("input");
    input.type = inputType;
    input.required = required;
    input.className = "form-input";

    container.appendChild(label);
    container.appendChild(input);
    return container;
  }

  function createCheckboxGroup(title, options) {
    const container = document.createElement("div");
    container.className = "checkbox-group";

    const heading = document.createElement("h3");
    heading.textContent = title;
    container.appendChild(heading);

    const inputs = options.map((text) => {
      const wrap = document.createElement("div");
      wrap.className = "checkbox-container";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = text.replace(/\s+/g, "_").toLowerCase();

      const label = document.createElement("label");
      label.htmlFor = input.id;
      label.textContent = text;

      wrap.appendChild(input);
      wrap.appendChild(label);
      return { wrap, input };
    });

    inputs.forEach(({ wrap }) => container.appendChild(wrap));

    container.getValue = () =>
      options.filter((_, i) => inputs[i].input.checked);
    return container;
  }

  function createSignaturePad() {
    const container = document.createElement("div");
    container.className = "form-section";

    const heading = document.createElement("h2");
    heading.textContent = "3. Signature";

    const description = document.createElement("p");
    description.textContent =
      "I hereby certify that I meet the criteria selected above...";

    const canvas = document.createElement("canvas");
    canvas.className = "signature-field";

    container.appendChild(heading);
    container.appendChild(description);
    container.appendChild(canvas);

    // Initialize SignaturePad after canvas is in DOM
    setTimeout(() => {
      container.signaturePad = new SignaturePad(canvas, {
        backgroundColor: "white",
      });
    }, 0);

    return container;
  }

  function buildForm() {
    const form = document.createElement("form");
    form.id = "investorForm";

    // Personal Information Section
    const personalSection = document.createElement("div");
    personalSection.className = "form-section";
    personalSection.innerHTML = "<h2>1. Personal Information</h2>";

    const inputs = {
      name: createLabeledInput("Name of Investor"),
      address: createLabeledInput("Address"),
      cityStateZip: createLabeledInput("City/State/ZIP"),
      email: createLabeledInput("Email", "email"),
      phone: createLabeledInput("Phone Number", "tel"),
    };

    Object.values(inputs).forEach((input) =>
      personalSection.appendChild(input)
    );

    // Qualifications Section
    const qualsSection = document.createElement("div");
    qualsSection.className = "form-section";
    qualsSection.innerHTML = "<h2>2. Qualifications</h2>";

    const individualQuals = createCheckboxGroup(
      "Individual Investor Qualifications",
      [
        "Net worth exceeding $1,000,000",
        "Annual income exceeding $200,000/$300,000",
        "Professional certifications holder",
        "Director/executive officer",
      ]
    );

    const entityQuals = createCheckboxGroup("Entity Investor Qualifications", [
      "Assets exceeding $5,000,000",
      "Trust with assets exceeding $5,000,000",
      "Registered investment company",
      "Private business development company",
      "All equity owners are accredited",
    ]);

    qualsSection.appendChild(individualQuals);
    qualsSection.appendChild(entityQuals);

    // Signature Section
    const signatureSection = createSignaturePad();

    // Supporting Documents Section
    const docsSection = document.createElement("div");
    docsSection.className = "form-section";
    docsSection.innerHTML = "<h2>4. Supporting Documentation</h2>";

    const supportingDocs = createCheckboxGroup("Required Documentation", [
      "Tax returns/W-2 forms",
      "Bank/brokerage statements",
      "Professional license verification",
      "CPA/attorney/advisor letter",
    ]);

    docsSection.appendChild(supportingDocs);

    // Buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";

    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.textContent = "Clear Signature";
    clearButton.onclick = () => signatureSection.signaturePad?.clear();

    const generateButton = document.createElement("button");
    generateButton.type = "button";
    generateButton.textContent = "Generate PDF";
    generateButton.onclick = () => {
      const data = {
        name: inputs.name.querySelector("input").value,
        address: inputs.address.querySelector("input").value,
        cityStateZip: inputs.cityStateZip.querySelector("input").value,
        email: inputs.email.querySelector("input").value,
        phone: inputs.phone.querySelector("input").value,
        indQuals: individualQuals.getValue(),
        entQuals: entityQuals.getValue(),
        docs: supportingDocs.getValue(),
        signature: signatureSection.signaturePad?.toDataURL() || "",
      };

      generatePDF(data);
    };

    buttonContainer.appendChild(clearButton);
    buttonContainer.appendChild(generateButton);

    // Assemble form
    form.appendChild(personalSection);
    form.appendChild(qualsSection);
    form.appendChild(signatureSection);
    form.appendChild(docsSection);
    form.appendChild(buttonContainer);

    return form;
  }

  function generatePDF(data) {
    const content = document.createElement("div");
    content.className = "pdf-content";
    content.innerHTML = `
      <h1>Accredited Investor Certification</h1>
      <h2>1. Personal Information</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Address:</strong> ${data.address}</p>
      <p><strong>City/State/ZIP:</strong> ${data.cityStateZip}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <h2>2. Individual Qualifications</h2>
      <ul>${data.indQuals.map((q) => `<li>${q}</li>`).join("")}</ul>
      <h2>3. Entity Qualifications</h2>
      <ul>${data.entQuals.map((q) => `<li>${q}</li>`).join("")}</ul>
      <h2>4. Supporting Documentation</h2>
      <ul>${data.docs.map((d) => `<li>${d}</li>`).join("")}</ul>
      <h2>5. Signature</h2>
      <img src="${
        data.signature
      }" style="max-width: 100%; border: 1px solid #ccc;" />
      <p>Date: ${new Date().toLocaleDateString()}</p>
    `;

    const opt = {
      margin: 1,
      filename: "investor_certification.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(content).save();
  }

  // Initialize form
  const root = document.getElementById("root");
  if (root) {
    root.appendChild(buildForm());
  }
});
```

<div id="root"></div>
