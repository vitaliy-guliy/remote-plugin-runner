/**
 * Generated using theia-plugin-generator
 */

import * as theia from '@theia/plugin';
import * as che from '@eclipse-che/plugin';
import { che as cheApi } from '@eclipse-che/api';

import * as path from 'path';
import * as fs from 'fs';

const ENDPOINT_RUNTIME = '/projects/theia/che/che-theia/dockerfiles/theia-endpoint-runtime';
let pluginDirectory: string;
let theiaDirectory: string;

const START: theia.Command = {
    id: 'remote-plugin:start',
    label: 'Remote Plugin: Start'
};

const ACTIONS: theia.Command = {
    id: 'remote-plugin:actions',
    label: 'Remote Plugin: Actions'
};

export function start(context: theia.PluginContext) {
    context.subscriptions.push(theia.commands.registerCommand(START, (...args: any[]) => {
        onStartRemotePlugin();
    }));
    context.subscriptions.push(theia.commands.registerCommand(ACTIONS, (...args: any[]) => {
        onShowPluginActions();
    }));
}

export function stop() {
}

async function onStartRemotePlugin() {
    if (!await selectRemotePluginPath()) {
        return;
    }

    if (!await selectTheiaPath()) {
        return;
    }

    await startRemotePluginLauncher();
    await startTheia();

    let item = theia.window.createStatusBarItem(theia.StatusBarAlignment.Left);
    item.text = '$(flask) Remote Plugin';
    item.tooltip = 'Remote plugin ' + pluginDirectory;
    item.command = 'remote-plugin:actions';
    item.show();

    let workspace: cheApi.workspace.Workspace = await che.workspace.getCurrentWorkspace();
    let devMachine = workspace!.runtime!.machines!['ws/dev'];
    let servers = devMachine.servers!;
    let pluginRunner = servers['plugin-runner-dev'];
    let url = pluginRunner.url;
    console.log('plugin runner ', pluginRunner);

    await wait(2000);

    let output = theia.window.createOutputChannel('Remote Plugin');
    output.show(true);
    output.appendLine(`URI to test the plugin: ${url}`);
}

async function onShowPluginActions() {

    theia.window.showQuickPick(
        ['Rebuild', 'Restart', 'Stop'],
        {
            onDidSelectItem: (item: theia.QuickPickItem | string) => {
                console.log('> selected item ', item);
            }
        }
    );

}

async function selectRemotePluginPath(): Promise<boolean> {
    theia.window.showInformationMessage('Select Plugin Direcotry');
    let uris: theia.Uri[] | undefined = await theia.window.showOpenDialog({});
    if (!uris || uris.length == 0) {
        return false;
    }

    let uri = uris[0];

    let stat = fs.statSync(uri.fsPath);
    if (stat.isDirectory()) {
        pluginDirectory = uri.fsPath;
    } else {
        pluginDirectory = path.dirname(uri.fsPath);
    }

    console.log('>> plugin directory ', pluginDirectory);
    return true;
}

async function startRemotePluginLauncher() {
    let terminal = theia.window.createTerminal({
        name: 'Remote Plugin',
        attributes: {
            'CHE_MACHINE_NAME': 'ws/dev-plugin'
        }
    });

    terminal.show(true);

    await wait(1000);

    terminal.sendText(`export THEIA_PLUGINS='local-dir://${pluginDirectory}'`);
    terminal.sendText(`cd ${ENDPOINT_RUNTIME}`);
    terminal.sendText('node lib/node/plugin-remote.js');

    await wait(3000);
}

async function selectTheiaPath(): Promise<boolean> {
    theia.window.showInformationMessage('Select Theia Direcotry');

    let uris: theia.Uri[] | undefined = await theia.window.showOpenDialog({});
    if (!uris || uris.length == 0) {
        return false;
    }

    let uri = uris[0];

    let stat = fs.statSync(uri.fsPath);
    if (stat.isDirectory()) {
        theiaDirectory = uri.fsPath;
    } else {
        theiaDirectory = path.dirname(uri.fsPath);
    }

    console.log('>> theia directory ', theiaDirectory);
    return true;
}

async function startTheia() {
    let terminal = theia.window.createTerminal({
        name: 'Theia',
        attributes: {
            'CHE_MACHINE_NAME': 'ws/dev'
        }
    });

    terminal.show(true);

    await wait(1000);

    terminal.sendText(`cd ${theiaDirectory}/examples/assembly`);
    terminal.sendText('yarn theia start --hostname=0.0.0.0 --port=3232');
}

async function wait(miliseconds: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, miliseconds);
    });
}
