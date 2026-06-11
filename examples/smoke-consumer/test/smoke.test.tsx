import { printSchema } from "graphql";
import { describe, expect, it } from "vitest";

import {
  Field,
  ObjectType,
  Query,
  String,
  renderSchema,
} from "@pinterest/alloy-graphql";

describe("smoke consumer integration", () => {
  it("renders a GraphQLSchema from Alloy-style components", () => {
    const schema = renderSchema(
      <>
        <ObjectType name="Widget">
          <Field name="id" type={String} />
        </ObjectType>
        <Query>
          <Field name="widget" type="Widget" />
        </Query>
      </>,
    );

    const sdl = printSchema(schema);
    expect(sdl).toContain("type Query");
    expect(sdl).toContain("widget: Widget");
    expect(sdl).toContain("type Widget");
    expect(sdl).toContain("id: String");
  });
});
