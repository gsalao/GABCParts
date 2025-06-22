import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import {
  PropertyFieldCollectionData,
  CustomCollectionFieldType
} from '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData';
import { SPComponentLoader } from '@microsoft/sp-loader'; 


import FlexButtons from './components/FlexButtons';
import { IFlexButtonsProps } from './components/IFlexButtonsProps';
import { IFlexButtonsWebPartProps } from '../../IFlexButtonsWebPartProps';

export default class FlexButtonsWebPart extends BaseClientSideWebPart<IFlexButtonsWebPartProps> {
  public async onInit(): Promise<void> {
    SPComponentLoader.loadCss('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap'); // use Montserrat re Sir Andy
    return super.onInit();
  }

  public render(): void {
    const limitedButtons = (this.properties.buttons || []).slice(0, 7);

    const element: React.ReactElement<IFlexButtonsProps> = React.createElement(FlexButtons, {
      buttons: limitedButtons
    });

    ReactDom.render(element, this.domElement);
  }

  public onDispose(): void {
      ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Configure your buttons (1–7)' },
          groups: [
            {
              groupName: 'Buttons',
              groupFields: [
                PropertyFieldCollectionData('buttons', {
                  key: 'buttons',
                  label: 'Buttons',
                  panelHeader: 'Edit buttons (max 7 recommended)',
                  manageBtnLabel: 'Manage buttons',
                  value: this.properties.buttons,
                  fields: [
                    {
                      id: 'label',
                      title: 'Label',
                      type: CustomCollectionFieldType.string,
                      required: true
                    },
                    {
                      id: 'url',
                      title: 'URL',
                      type: CustomCollectionFieldType.string,
                      required: true
                    },
                    {
                      id: 'bgColor',
                      title: 'Background Color',
                      type: CustomCollectionFieldType.string
                    },
                    {
                      id: 'textColor',
                      title: 'Text Color',
                      type: CustomCollectionFieldType.string
                    },
                    {
                      id: 'fontSize',
                      title: 'Font Size (e.g. 16px)',
                      type: CustomCollectionFieldType.string
                    },
                    {
                      id: 'fontStyle',
                      title: 'Font Style (e.g. italic)',
                      type: CustomCollectionFieldType.string
                    },
                    {
                      id: 'imageUrl',
                      title: 'Image URL (optional)',
                      type: CustomCollectionFieldType.string
                    }
                  ],
                  disableItemCreation: false,
                  disableItemDeletion: false,
                })
              ]
            }
          ]
        }
      ]
    };
  }
}