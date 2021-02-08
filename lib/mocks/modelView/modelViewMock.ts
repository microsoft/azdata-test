/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as TypeMoq from 'typemoq';
import { StubButton } from '../../stubs/modelView/stubButton';
import { StubCheckbox, StubInputBox } from '../../stubs/modelView/stubCheckbox';
import { StubDivContainer } from '../../stubs/modelView/stubDivContainer';
import { StubFlexContainer } from '../../stubs/modelView/stubFlexContainer';
import { StubRadioButton } from '../../stubs/modelView/stubRadioButton';
import { StubText } from '../../stubs/modelView/stubText';

export type ComponentAndMockComponentBuilder<C, B> = {
	component: C,
	mockBuilder: TypeMoq.IMock<B>
};

export type ComponentFactories = {
	checkBox?: () => azdata.CheckBoxComponent,
	text?: () => azdata.TextComponent,
	radioButton?: () => azdata.RadioButtonComponent,
	inputBox?: () => azdata.InputBoxComponent,
	button?: () => azdata.ButtonComponent,
	loadingComponent?: () => azdata.LoadingComponent,
	groupContainer?: () => azdata.GroupContainer,
	divContainer?: () => azdata.DivContainer,
	flexContainer?: () => azdata.FlexContainer,
	formContainer?: () => azdata.FormContainer
}

/**
 * Creates a mock ModelView to simulate interactions with the ADS ModelView API
 * @param componentFactories Used to specify factory methods to create the component mocks if more fine grained control is required
 */
export function createModelViewMock(componentFactories?: ComponentFactories): {
	modelBuilderMock: TypeMoq.IMock<azdata.ModelBuilder>,
	modelViewMock: TypeMoq.IMock<azdata.ModelView>
} {
	const mockModelView = TypeMoq.Mock.ofType<azdata.ModelView>();
	const mockModelBuilder = TypeMoq.Mock.ofType<azdata.ModelBuilder>();

	mockModelBuilder.setup(b => b.checkBox()).returns(() => {
		const mockCheckbox = createComponentBuilderMock<azdata.CheckBoxComponent>(componentFactories?.checkBox?.() ?? new StubCheckbox());
		return mockCheckbox.mockBuilder.object;
	});
	mockModelBuilder.setup(b => b.text()).returns(() => {
		const mockTextBuilder = createComponentBuilderMock<azdata.TextComponent>(componentFactories?.text?.() ?? new StubText());
		return mockTextBuilder.mockBuilder.object;
	});
	mockModelBuilder.setup(b => b.radioButton()).returns(() => {
		const mockRadioButton = createComponentBuilderMock<azdata.RadioButtonComponent>(componentFactories?.radioButton?.() ?? new StubRadioButton());
		return mockRadioButton.mockBuilder.object;
	});
	mockModelBuilder.setup(b => b.inputBox()).returns(() => {
		const mockInputBox = createComponentBuilderMock<azdata.InputBoxComponent>(componentFactories?.inputBox?.() ?? new StubInputBox());
		return mockInputBox.mockBuilder.object;
	});
	mockModelBuilder.setup(b => b.button()).returns(() => {
		const mockButton = createComponentBuilderMock<azdata.ButtonComponent, azdata.ButtonProperties>(componentFactories?.button?.() ?? new StubButton());
		return mockButton.mockBuilder.object;
	});
	mockModelBuilder.setup(b => b.loadingComponent()).returns(() => {
		const mockLoadingBuilder = createLoadingComponentBuilderMock(componentFactories?.loadingComponent?.());
		return mockLoadingBuilder.mockBuilder.object;
	});
	mockModelBuilder.setup(b => b.groupContainer()).returns(() => {
		const mockGroupContainerBuilder = createContainerBuilderMock<azdata.GroupContainer>(componentFactories?.groupContainer?.());
		return mockGroupContainerBuilder.mockBuilder.object;
	});
	mockModelBuilder.setup(b => b.divContainer()).returns(() => {
		const mockDivContainerBuilder = createContainerBuilderMock<azdata.DivContainer>(componentFactories?.divContainer?.() ?? new StubDivContainer());
		return mockDivContainerBuilder.mockBuilder.object;
	});
	mockModelBuilder.setup(b => b.flexContainer()).returns(() => {
		const mockFlexContainerBuilder = createContainerBuilderMock<azdata.FlexContainer>(componentFactories?.flexContainer?.() ?? new StubFlexContainer());
		return mockFlexContainerBuilder.mockBuilder.object;
	});
	mockModelBuilder.setup(b => b.formContainer()).returns(() => {
		const mockFormContainerBuilder = createFormContainerBuilderMock(componentFactories?.formContainer?.());
		return mockFormContainerBuilder.object;
	});
	mockModelView.setup(mv => mv.modelBuilder).returns(() => mockModelBuilder.object);
	return {
		modelBuilderMock: mockModelBuilder,
		modelViewMock: mockModelView
	};
}

export function createFormContainerBuilderMock(container?: azdata.FormContainer): TypeMoq.IMock<azdata.FormBuilder> {
	const mockContainerBuilder = createContainerBuilderMock<azdata.FormContainer, azdata.ComponentProperties, azdata.FormBuilder>(container);
	mockContainerBuilder.mockBuilder.setup(b => b.withFormItems(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => mockContainerBuilder.mockBuilder.object);
	return mockContainerBuilder.mockBuilder;
}

export function createContainerBuilderMock<C extends azdata.Container<any, any>, P extends azdata.ComponentProperties = azdata.ComponentProperties, B extends azdata.ContainerBuilder<C, any, any, P> = azdata.ContainerBuilder<C, any, any, P>>(container?: C): ComponentAndMockComponentBuilder<C, B> {
	const mockContainerBuilder = createComponentBuilderMock<C, P, B>(container);
	// For now just have these be passthrough - can hook up additional functionality later if needed
	mockContainerBuilder.mockBuilder.setup(b => b.withItems(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns((items) => {
		mockContainerBuilder.component.addItems(items);
		return mockContainerBuilder.mockBuilder.object;
	});
	mockContainerBuilder.mockBuilder.setup(b => b.withItems(TypeMoq.It.isAny(), undefined)).returns((items) => {
		mockContainerBuilder.component.addItems(items);
		return mockContainerBuilder.mockBuilder.object;
	});
	mockContainerBuilder.mockBuilder.setup(b => b.withLayout(TypeMoq.It.isAny())).returns(() => mockContainerBuilder.mockBuilder.object);
	return mockContainerBuilder;
}

export function createLoadingComponentBuilderMock(component?: azdata.LoadingComponent): ComponentAndMockComponentBuilder<azdata.LoadingComponent, azdata.LoadingComponentBuilder> {
	const mockComponentBuilder = createComponentBuilderMock<azdata.LoadingComponent, azdata.LoadingComponentProperties, azdata.LoadingComponentBuilder>(component);
	mockComponentBuilder.mockBuilder.setup(x => x.withItem(TypeMoq.It.isAny())).returns(() => mockComponentBuilder.mockBuilder.object);
	return mockComponentBuilder;
}

export function createComponentBuilderMock<C extends azdata.Component, P extends azdata.ComponentProperties = azdata.ComponentProperties, B extends azdata.ComponentBuilder<C, P> = azdata.ComponentBuilder<C, P>>(component?: C): ComponentAndMockComponentBuilder<C, B> {
	const mockComponentBuilder = TypeMoq.Mock.ofType<B>();
	// Create a mocked dynamic component if we don't have a stub instance to use.
	// Note that we don't use ofInstance here for the component because there's some limitations around properties that I was
	// hitting preventing me from easily using TypeMoq. Passing in the stub instance lets users control the object being stubbed - which means
	// they can use things like sinon to then override specific functions if desired.
	if (!component) {
		const mockComponent = TypeMoq.Mock.ofType<C>();
		// Need to setup then for when a dynamic mocked object is resolved otherwise the test will hang : https://github.com/florinn/typemoq/issues/66
		mockComponent.setup((x: any) => x.then).returns(() => undefined);
		component = mockComponent.object;
	}

	mockComponentBuilder.setup(b => b.withProperties(TypeMoq.It.isAny())).returns((props) => {
		// Apply the properties to the object directly
		for (const key in props) {
			component[key] = props[key];
		}
		return mockComponentBuilder.object;
	});
	mockComponentBuilder.setup(b => b.withValidation(TypeMoq.It.isAny())).returns(() => mockComponentBuilder.object);
	mockComponentBuilder.setup(b => b.component()).returns(() => component!);
	return {
		component: component!,
		mockBuilder: mockComponentBuilder
	};
}