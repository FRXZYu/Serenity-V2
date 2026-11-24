/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import './utils/preloadAssets';
import {ALL_SERENITY_ASSET_URLS} from './utils/preloadAssets';
import {CosmicBackdrop} from './components/CosmicBackdrop';
import {SerenityFlow} from './components/SerenityFlow';

export default function App() {
  return (
    <div className="relative min-h-[100dvh] bg-[#040208] text-[#f5f0fc]">
      {/* Off-screen warm GPU texture cache so all emblem & alternative images are ready before reveal */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-[9999px] top-0 h-px w-px overflow-hidden opacity-[0.001]"
      >
        {ALL_SERENITY_ASSET_URLS.map((src) => (
          <img key={src} src={src} alt="" loading="eager" decoding="sync" width={1} height={1} />
        ))}
      </div>
      <CosmicBackdrop />
      <SerenityFlow />
    </div>
  );
}
