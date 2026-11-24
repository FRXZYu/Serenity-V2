/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {CosmicBackdrop} from './components/CosmicBackdrop';
import {SerenityFlow} from './components/SerenityFlow';

export default function App() {
  return (
    <div className="relative min-h-[100dvh] bg-[#040208] text-[#f5f0fc]">
      <CosmicBackdrop />
      <SerenityFlow />
    </div>
  );
}
