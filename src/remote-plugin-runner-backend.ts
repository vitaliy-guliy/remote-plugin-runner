/**
 * Generated using theia-plugin-generator
 */

import * as theia from '@theia/plugin';

export function start(context: theia.PluginContext) {
    const informationMessageTestCommand = {
        id: 'remote-plugin-runner-hello',
        label: "Remote Plugin Runner: Hello"
    };
    context.subscriptions.push(theia.commands.registerCommand(informationMessageTestCommand, (...args: any[]) => {
        theia.window.showInformationMessage('Remote Plugin Runner!');
    }));
}

export function stop() {

}
