import CreateSchemas from "./CreateSchemas";

test('test schema', () => {
  let schema = { "description": "<b>Walkathon</b> registration training form.", "ui:order": [ "email", "phone", "address", "participants", "cause", "howHeard", "acceptTerms", "additionalDonation", "roundOff", "couponCode", "manualEntry", "bird" ], "title": "Walkathon Registration Training Form", "type": "object", "definitions": { "name": { "ui:order": [ "first", "last" ], "title": null, "type": "object", "properties": { "last": { "classNames": "twoColumn", "title": "Last Name", "type": "string", "required": true, "ui:placeholder": "Last Name" }, "first": { "classNames": "twoColumn", "title": "First Name", "type": "string", "required": true, "ui:placeholder": "First Name" } }, "required": true }, "phone": { "ui:widget": "phone", "title": "Phone Number", "type": "string", "ui:placeholder": "Phone Number" }, "email": { "ui:cff:nonModifiable": true, "format": "email", "type": "string", "ui:placeholder": "Email Address" }, "emergency_contact": { "ui:order": [ "name", "phone" ], "title": "Emergency Contact Name", "type": "object", "properties": { "name": { "type": "object", "properties": { "last": { "classNames": "twoColumn", "title": "Contact Last Name", "type": "string", "required": true }, "first": { "classNames": "twoColumn", "title": "Contact First Name", "type": "string", "required": true } } }, "phone": { "$ref": "#/definitions/phone" } } } }, "properties": { "manualEntry": { "title": "Method of Payment", "type": "string", "enum": [ "Cash", "Check", "Other" ] }, "additionalDonation": { "ui:widget": "cff:money", "description": "All Donations are Tax-Deductible.", "title": "Additional Donation", "type": "number", "minimum": 0, "required": false }, "howHeard": { "type": "string" }, "address": { "ui:order": [ "line1", "line2", "city", "state", "zipcode" ], "type": "object", "properties": { "zipcode": { "type": "string", "classNames": "threeColumn", "required": true }, "state": { "type": "string", "classNames": "threeColumn", "required": true }, "city": { "type": "string", "classNames": "threeColumn", "required": true }, "line2": { "title": "Address Line 2", "type": "string" }, "line1": { "title": "Address Line 1", "type": "string", "required": true } }, "required": true }, "phone": { "$ref": "#/definitions/phone" }, "bird": { "type": "string" }, "acceptTerms": { "description": "I agree to the Terms and Conditions.", "title": "Accept Terms and Conditions", "type": "boolean", "required": true }, "cause": { "title": "Support a cause", "type": "string" }, "roundOff": { "ui:widget": "cff:roundOff", "title": "Round off", "type": "boolean", "required": false }, "couponCode": { "ui:widget": "cff:couponCode", "description": "Coupon will be applied at checkout.", "title": "Coupon Code", "type": "string" }, "email": { "$ref": "#/definitions/email" }, "participants": { "minItems": 1, "ui:options": { "addable": true, "orderable": false }, "title": "Participants", "type": "array", "items": { "type": "object", "ui:order": [ "name", "gender", "phone", "email", "age", "race", "emergency_contact", "shirt_size", "has_bib_name", "bib_name", "bib_number" ], "properties": { "gender": { "type": "string", "enum": [ "M", "F" ], "required": true, "ui:placeholder": "Select gender" }, "has_bib_name": { "title": "Personalize your Bib?", "type": "boolean" }, "race": { "type": "string", "required": true, "ui:placeholder": "Select race" }, "bib_name": { "title": "Personalized Bib Name", "type": "string" }, "phone": { "$ref": "#/definitions/phone" }, "shirt_size": { "title": "T Shirt Size", "type": "string", "enum": [ "Youth S", "Youth M", "Youth L", "Adult S", "Adult M", "Adult L" ], "ui:placeholder": "Select T-Shirt Size" }, "bib_number": { "type": "string" }, "name": { "$ref": "#/definitions/name" }, "age": { "type": "number", "ui:placeholder": "Age" }, "email": { "$ref": "#/definitions/email" }, "emergency_contact": { "$ref": "#/definitions/emergency_contact" } } }, "uniqueItems": true } } }
  let schemaModifier = { "description": "Ocean's Eighteen description", "ui:order": [ "registration_type", "participants", "emergency_contact" ], "registration_type": { "title": "Room Type", "ui:placeholder": "Select a room type...", "enum": ["Single", "Double"], "enumNames": ["Single", "Double"] }, "emergency_contact": { "title": " ", "full_name": { "title": "Emergency Contact Name", "required": true } , "phone": { "title": "Emergency Contact Phone", "required": true } }, "title": "Ocean's Eighteen Registration Form", "participants": { "ui:options": { "addable": false }, "minItems": 2, "description": "Single Room or Couples/Shared Room\n\n(Single room 300 $ include camp fee ,food and accommodation)\n\n(Couples / Shared Room 500 $ include camp fee ,food and accommodation)", "maxItems": 2, "ui:cff:addButtonText": "Add a registrant (shared room)", "title": "Registrants", "items": { "name": { "last": { "classNames": "col-12 col-sm-6" }, "first": { "classNames": "col-12 col-sm-6" } }, "phone": { "classNames": "col-12 col-sm-6", "required": true }, "email": { "classNames": "col-12 col-sm-6", "required": true } } } }
  CreateSchemas.createSchemas({
    "schema": {"value": schema },
    "schemaModifier": {"value": schemaModifier }
  }, []);
  // expect(createSchemas({"schema": {"value": schema }, {"schemaModifier": {"value": schemaModifier } ])).toEqual({'a': 3.00, 'b': 11.00});
  // expect(ExpressionParser.dict_array_to_sum_dict([{"a":2, "b":5}, {"a":1}])).toEqual({'a': 3.00, 'b': 5.00});
});

test('required override', () => {
  let schema = {"type": "object", "required": ["olda", "oldb", "oldc"], "properties": {}};
  let schemaModifier = {"required": ["new", "new2"]}
  let result = CreateSchemas.createSchemas({
    "schema": {"value": schema },
    "schemaModifier": {"value": schemaModifier }
  }, []);
  expect(result.schema).toEqual({"type": "object", "properties": {}, "required": ["new", "new2"]});
  expect(result.uiSchema).toEqual({});
});

test('required override with no required in schema', () => {
  let schema = {"type": "object", "properties": {}};
  let schemaModifier = {"required": ["new", "new2"]}
  let result = CreateSchemas.createSchemas({
    "schema": {"value": schema },
    "schemaModifier": {"value": schemaModifier }
  }, []);
  expect(result.schema).toEqual({"type": "object", "properties": {}, "required": ["new", "new2"]});
  expect(result.uiSchema).toEqual({});
});

test('ocean retreat should override required', () => {
  let schema = require("./ocean.schema.json");
  let schemaModifier = require("./ocean.schemaModifier.json");
  let result = CreateSchemas.createSchemas({
    "schema": {"value": schema },
    "schemaModifier": {"value": schemaModifier }
  }, []);
  expect(result.schema.required).toEqual([
    "participants",
    "address",
    "emergency_contact"
  ]);
});

test('color schema', () => {
  let result = CreateSchemas.createSchemas({
    "schema": {"value": require("./color.old.schema.json") },
    "schemaModifier": {"value": require("./color.old.schemaModifier.json") }
  }, []);
  expect(result.schema).toEqual(require("./color.new.schema.json"));
  expect(result.uiSchema).toEqual(require("./color.new.uiSchema.json"));
});

test('keep schema and uischema the same.', () => {
  let paymentInfo = {"A":"B"};
  let result = CreateSchemas.createSchemas({
    "schema": require("./color.new.schema.json"),
    "uiSchema": require("./color.new.uiSchema.json"),
    "formOptions": {
      "paymentInfo": paymentInfo
    }
  }, []);
  expect(result.schema).toEqual(require("./color.new.schema.json"));
  expect(result.uiSchema).toEqual(require("./color.new.uiSchema.json"));
  expect(result.paymentCalcInfo).toEqual(paymentInfo);
});