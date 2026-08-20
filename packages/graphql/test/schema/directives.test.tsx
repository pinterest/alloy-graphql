import { namekey } from "@alloy-js/core";
import {
  Argument,
  Directive,
  DirectiveDefinition,
  EnumType,
  EnumValue,
  Field,
  InputField,
  InputObjectType,
  InputValue,
  ObjectType,
  Query,
  ScalarType,
  String,
  renderSchema,
} from "@pinterest/alloy-graphql";
import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLObjectType,
  Kind,
  type ConstValueNode,
} from "graphql";
import { describe, expect, it } from "vitest";

describe("directive applications", () => {
  it("attaches directives across schema elements", () => {
    const schema = renderSchema(
      <>
        <DirectiveDefinition
          name="tag"
          locations={[
            "SCHEMA",
            "OBJECT",
            "FIELD_DEFINITION",
            "ARGUMENT_DEFINITION",
            "INPUT_FIELD_DEFINITION",
            "ENUM_VALUE",
          ]}
        >
          <InputValue name="label" type={String} nonNull />
        </DirectiveDefinition>
        <Directive name="tag">
          <Argument name="label" value="schema" />
        </Directive>
        <EnumType name="Role">
          <EnumValue name="ADMIN">
            <Directive name="tag">
              <Argument name="label" value="enum" />
            </Directive>
          </EnumValue>
        </EnumType>
        <InputObjectType name="Filter">
          <InputField name="term" type={String}>
            <Directive name="tag">
              <Argument name="label" value="inputField" />
            </Directive>
          </InputField>
        </InputObjectType>
        <ObjectType name="User">
          <Directive name="tag">
            <Argument name="label" value="type" />
          </Directive>
          <Field name="name" type={String}>
            <Directive name="tag">
              <Argument name="label" value="field" />
            </Directive>
            <InputValue name="filter" type={String}>
              <Directive name="tag">
                <Argument name="label" value="argument" />
              </Directive>
            </InputValue>
          </Field>
        </ObjectType>
        <Query>
          <Field name="me" type="User" />
        </Query>
      </>,
    );

    const schemaNode = schema.astNode;
    expect(
      schemaNode?.directives?.map((directive) => directive.name.value),
    ).toEqual(["tag"]);
    expect(schemaNode?.directives?.[0].arguments?.[0]).toMatchObject({
      kind: Kind.ARGUMENT,
      name: { kind: Kind.NAME, value: "label" },
      value: { kind: Kind.STRING, value: "schema" },
    });

    const user = schema.getType("User");
    expect(user).toBeInstanceOf(GraphQLObjectType);
    const userType = user as GraphQLObjectType;
    expect(userType.astNode?.directives?.[0].name.value).toBe("tag");

    const userField = userType.getFields().name;
    expect(userField.astNode?.directives?.[0].name.value).toBe("tag");

    const arg = userField.args.find((argument) => argument.name === "filter");
    expect(arg?.astNode?.directives?.[0].name.value).toBe("tag");

    const filter = schema.getType("Filter");
    expect(filter).toBeInstanceOf(GraphQLInputObjectType);
    const filterType = filter as GraphQLInputObjectType;
    expect(
      filterType.getFields().term.astNode?.directives?.[0].name.value,
    ).toBe("tag");

    const role = schema.getType("Role");
    expect(role).toBeInstanceOf(GraphQLEnumType);
    const roleType = role as GraphQLEnumType;
    expect(
      roleType.getValue("ADMIN")?.astNode?.directives?.[0].name.value,
    ).toBe("tag");
  });

  it("resolves directive namekeys", () => {
    const tag = namekey("tag");
    const schema = renderSchema(
      <>
        <DirectiveDefinition name={tag} locations={["FIELD_DEFINITION"]} />
        <Query>
          <Field name="ping" type={String}>
            <Directive name={tag} />
          </Field>
        </Query>
      </>,
    );

    const field = schema.getQueryType()?.getFields().ping;
    expect(field?.astNode?.directives?.[0].name.value).toBe("tag");
  });

  it("rejects duplicate directive arguments", () => {
    expect(() =>
      renderSchema(
        <>
          <DirectiveDefinition name="flag" locations={["FIELD_DEFINITION"]}>
            <InputValue name="state" type={String} />
          </DirectiveDefinition>
          <Query>
            <Field name="ping" type={String}>
              <Directive name="flag">
                <Argument name="state" value="on" />
                <Argument name="state" value="off" />
              </Directive>
            </Field>
          </Query>
        </>,
      ),
    ).toThrow('Directive argument "state" is already defined.');
  });

  it("rejects unknown directives", () => {
    expect(() =>
      renderSchema(
        <Query>
          <Field name="ping" type={String}>
            <Directive name="missing" />
          </Field>
        </Query>,
      ),
    ).toThrow(/Directive "@missing" is not defined/);
  });

  it("validates directive locations", () => {
    expect(() =>
      renderSchema(
        <>
          <DirectiveDefinition name="flag" locations={["OBJECT"]} />
          <Query>
            <Field name="ping" type={String}>
              <Directive name="flag" />
            </Field>
          </Query>
        </>,
      ),
    ).toThrow(/cannot be applied/);
  });

  it("validates repeatable directives", () => {
    expect(() =>
      renderSchema(
        <>
          <DirectiveDefinition name="flag" locations={["FIELD_DEFINITION"]} />
          <Query>
            <Field name="ping" type={String}>
              <Directive name="flag" />
              <Directive name="flag" />
            </Field>
          </Query>
        </>,
      ),
    ).toThrow(/cannot be repeated/);
  });

  it("allows repeatable directives", () => {
    const schema = renderSchema(
      <>
        <DirectiveDefinition
          name="tag"
          repeatable
          locations={["FIELD_DEFINITION"]}
        >
          <InputValue name="label" type={String} />
        </DirectiveDefinition>
        <Query>
          <Field name="ping" type={String}>
            <Directive name="tag">
              <Argument name="label" value="first" />
            </Directive>
            <Directive name="tag">
              <Argument name="label" value="second" />
            </Directive>
          </Field>
        </Query>
      </>,
    );

    const field = schema.getQueryType()?.getFields().ping;
    expect(
      field?.astNode?.directives?.map((directive) => directive.name.value),
    ).toEqual(["tag", "tag"]);
  });

  it("validates directive arguments", () => {
    expect(() =>
      renderSchema(
        <>
          <DirectiveDefinition name="flag" locations={["FIELD_DEFINITION"]}>
            <InputValue name="level" type={String} nonNull />
          </DirectiveDefinition>
          <Query>
            <Field name="ping" type={String}>
              <Directive name="flag">
                <Argument name="unknown" value="oops" />
              </Directive>
            </Field>
          </Query>
        </>,
      ),
    ).toThrow(/Unknown argument "unknown"/);

    expect(() =>
      renderSchema(
        <>
          <DirectiveDefinition name="flag" locations={["FIELD_DEFINITION"]}>
            <InputValue name="level" type={String} nonNull />
          </DirectiveDefinition>
          <Query>
            <Field name="ping" type={String}>
              <Directive name="flag" />
            </Field>
          </Query>
        </>,
      ),
    ).toThrow(/missing required argument "level"/);
  });

  it("validates directive argument coercion", () => {
    expect(() =>
      renderSchema(
        <>
          <DirectiveDefinition name="range" locations={["FIELD_DEFINITION"]}>
            <InputValue name="limit" type="Int" />
          </DirectiveDefinition>
          <Query>
            <Field name="ping" type={String}>
              <Directive name="range">
                <Argument name="limit" value="bad" />
              </Directive>
            </Field>
          </Query>
        </>,
      ),
    ).toThrow(/cannot represent non-integer value/);
  });

  it("cannot coerce a custom-scalar directive argument without a valueNode", () => {
    expect(() =>
      renderSchema(
        <>
          <ScalarType name="JSON" serialize={(value: unknown) => value} />
          <DirectiveDefinition name="config" locations={["FIELD_DEFINITION"]}>
            <InputValue name="data" type="JSON" />
          </DirectiveDefinition>
          <Query>
            <Field name="ping" type={String}>
              <Directive name="config">
                <Argument name="data" value={{ nested: { structure: true } }} />
              </Directive>
            </Field>
          </Query>
        </>,
      ),
    ).toThrow(/Cannot convert value to AST/);
  });

  it("honors a pre-built valueNode to bypass astFromValue for custom scalars", () => {
    const rawValueNode: ConstValueNode = {
      kind: Kind.OBJECT,
      fields: [
        {
          kind: Kind.OBJECT_FIELD,
          name: { kind: Kind.NAME, value: "nested" },
          value: { kind: Kind.BOOLEAN, value: true },
        },
      ],
    };

    const schema = renderSchema(
      <>
        <ScalarType name="JSON" serialize={(value: unknown) => value} />
        <DirectiveDefinition name="config" locations={["FIELD_DEFINITION"]}>
          <InputValue name="data" type="JSON" />
        </DirectiveDefinition>
        <Query>
          <Field name="ping" type={String}>
            <Directive name="config">
              <Argument name="data" valueNode={rawValueNode} />
            </Directive>
          </Field>
        </Query>
      </>,
    );

    const field = schema.getQueryType()?.getFields().ping;
    expect(field?.astNode?.directives?.[0].arguments?.[0].value).toEqual(
      rawValueNode,
    );
  });

  it("rejects directive conflicts with built-in props", () => {
    expect(() =>
      renderSchema(
        <Query>
          <Field name="ping" type={String} deprecated>
            <Directive name="deprecated" />
          </Field>
        </Query>,
      ),
    ).toThrow(/@deprecated" conflicts with deprecated props/);

    expect(() =>
      renderSchema(
        <>
          <InputObjectType name="Filter" oneOf>
            <Directive name="oneOf" />
            <InputField name="id" type={String} />
          </InputObjectType>
          <Query>
            <Field name="ping" type={String}>
              <InputValue name="filter" type="Filter" />
            </Field>
          </Query>
        </>,
      ),
    ).toThrow(/@oneOf" conflicts with the oneOf prop/);

    expect(() =>
      renderSchema(
        <>
          <ScalarType
            name="Url"
            specifiedByUrl="https://example.com/spec#url"
            serialize={(value: unknown) => value}
          >
            <Directive name="specifiedBy" />
          </ScalarType>
          <Query>
            <Field name="ping" type={String} />
          </Query>
        </>,
      ),
    ).toThrow(/@specifiedBy" conflicts with specifiedByUrl/);
  });
});
